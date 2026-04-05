const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const mongoose = require('mongoose');

// Mocks the models
jest.mock('../../src/modules/auth/models/account.model');
jest.mock('../../src/modules/auth/models/role.model');
jest.mock('../../src/modules/auth/models/email-verification.model');
jest.mock('../../src/modules/auth/models/profile.model');
jest.mock('../../src/modules/auth/models/session.model');
jest.mock('../../src/modules/auth/models/login-attempt.model');
jest.mock('../../src/modules/patient/model/patient.model');

// Mock utilities & services
jest.mock('../../src/common/service/email.service');
jest.mock('../../src/common/utils/logger', () => ({
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
}));
jest.mock('../../src/common/utils/jwt', () => ({
    signToken: jest.fn(),
    signRefreshToken: jest.fn(),
    hashToken: jest.fn()
}));
jest.mock('google-auth-library', () => {
    return {
        OAuth2Client: jest.fn().mockImplementation(() => ({
            verifyIdToken: jest.fn()
        }))
    }
});

const Account = require('../../src/modules/auth/models/account.model');
const Role = require('../../src/modules/auth/models/role.model');
const EmailVerification = require('../../src/modules/auth/models/email-verification.model');
const Profile = require('../../src/modules/auth/models/profile.model');
const Patient = require('../../src/modules/patient/model/patient.model');
const LoginAttempt = require('../../src/modules/auth/models/login-attempt.model');
const Session = require('../../src/modules/auth/models/session.model');

const emailService = require('../../src/common/service/email.service');
const { signToken, signRefreshToken, hashToken } = require('../../src/common/utils/jwt');

const { ValidationError, ConflictError, NotFoundError, ForbiddenError, UnauthorizedError } = require('../../src/common/errors');
const authService = require('../../src/modules/auth/service/auth.service');

describe('Auth Service', () => {

    beforeEach(() => {
        jest.clearAllMocks();

        // Mock mongoose transaction
        mongoose.startSession = jest.fn().mockResolvedValue({
            startTransaction: jest.fn(),
            commitTransaction: jest.fn(),
            abortTransaction: jest.fn(),
            endSession: jest.fn()
        });
    });

    describe('register(data)', () => {
        const validData = {
            username: 'quoc123',
            email: 'quoc@ex.com',
            password: 'ValidPassword123!',
            full_name: 'Quoc Nguyen',
            phone_number: '0123456789'
        };

        it('should register successfully and return account, user, patient (Normal)', async () => {
            Account.findOne.mockResolvedValue(null); // No email, no username, no phone
            Role.findOne.mockResolvedValue({ _id: 'roleId', name: 'PATIENT' });

            const mockHashedVal = 'hashedpassword';
            jest.spyOn(bcryptjs, 'hash').mockResolvedValue(mockHashedVal);

            Account.create.mockResolvedValue([{ _id: 'acc1', username: 'quoc123', email: 'quoc@ex.com', status: 'PENDING' }]);
            EmailVerification.create.mockResolvedValue([{}]);
            Profile.create.mockResolvedValue([{ _id: 'prof1', full_name: 'Quoc Nguyen' }]);
            Patient.create.mockResolvedValue([{ _id: 'pat1', profile_id: 'prof1' }]);

            const result = await authService.register(validData);

            expect(result).toHaveProperty('account');
            expect(result).toHaveProperty('user');
            expect(result).toHaveProperty('patient');
            expect(result.account.username).toBe('quoc123');
            expect(emailService.sendEmailVerificationEmail).toHaveBeenCalled();
        });

        it('should throw ValidationError if required fields are missing (Abnormal)', async () => {
            const missingData = { username: 'quoc123' }; // missing password, email, full_name
            await expect(authService.register(missingData))
                .rejects
                .toThrow(ValidationError);
        });

        it('should throw ValidationError if username is too short (Boundary)', async () => {
            const shortNameData = { ...validData, username: 'qu' };
            await expect(authService.register(shortNameData))
                .rejects
                .toThrow(ValidationError);
        });

        it('should throw ConflictError if email already exists (Abnormal)', async () => {
            Account.findOne.mockResolvedValueOnce({ _id: 'existingId' }); // Returns an account for email check
            await expect(authService.register(validData))
                .rejects
                .toThrow(ConflictError);
        });
    });

    describe('login(data)', () => {
        const loginData = { identifier: 'user@example.com', password: 'ValidPassword123!' };

        it('should login successfully and return tokens (Normal)', async () => {
            const mockAccount = {
                _id: 'acc1',
                email: 'user@example.com',
                password: 'hashedpw',
                status: 'ACTIVE',
                role_id: { _id: 'role1', name: 'PATIENT', permissions: [] }
            };

            // Populate chaining mock
            Account.findOne.mockReturnValue({
                select: jest.fn().mockReturnThis(),
                populate: jest.fn().mockResolvedValue(mockAccount)
            });

            LoginAttempt.countDocuments.mockResolvedValue(0);
            jest.spyOn(bcryptjs, 'compare').mockResolvedValue(true);

            const mockProfile = { _id: 'prof1', full_name: 'John Doe' };
            Profile.findOne.mockResolvedValue(mockProfile);

            signToken.mockReturnValue('access_token');
            signRefreshToken.mockReturnValue('refresh_token');
            hashToken.mockReturnValue('hashed_refresh_token');

            Session.create.mockResolvedValue({});
            LoginAttempt.create.mockResolvedValue({});

            const result = await authService.login(loginData);
            expect(result.token).toBe('access_token');
            expect(result.refreshToken).toBe('refresh_token');
        });

        it('should throw ForbiddenError if account is inactive (Abnormal)', async () => {
            const mockAccount = {
                _id: 'acc1',
                email: 'user@example.com',
                password: 'hashedpw',
                status: 'INACTIVE',
                role_id: { _id: 'role1', name: 'PATIENT', permissions: [] }
            };

            Account.findOne.mockReturnValue({
                select: jest.fn().mockReturnThis(),
                populate: jest.fn().mockResolvedValue(mockAccount)
            });
            LoginAttempt.countDocuments.mockResolvedValue(0);

            await expect(authService.login(loginData))
                .rejects
                .toThrow(ForbiddenError);
        });

        it('should throw UnauthorizedError if password is wrong (Abnormal)', async () => {
            const mockAccount = {
                _id: 'acc1', email: 'user@example.com', password: 'hashedpw', status: 'ACTIVE',
                role_id: { name: 'PATIENT', permissions: [] }
            };
            Account.findOne.mockReturnValue({
                select: jest.fn().mockReturnThis(), populate: jest.fn().mockResolvedValue(mockAccount)
            });
            LoginAttempt.countDocuments.mockResolvedValue(0);
            jest.spyOn(bcryptjs, 'compare').mockResolvedValue(false); // wrong code
            LoginAttempt.create.mockResolvedValue({});

            await expect(authService.login(loginData))
                .rejects
                .toThrow(UnauthorizedError);
        });

        it('should throw ForbiddenError if locked out by too many attempts (Boundary)', async () => {
            const mockAccount = {
                _id: 'acc1', email: 'user@example.com', password: 'hashedpw', status: 'ACTIVE',
                role_id: { name: 'PATIENT', permissions: [] }
            };
            Account.findOne.mockReturnValue({
                select: jest.fn().mockReturnThis(), populate: jest.fn().mockResolvedValue(mockAccount)
            });
            LoginAttempt.countDocuments.mockResolvedValue(5); // Locked out

            await expect(authService.login(loginData))
                .rejects
                .toThrow(ForbiddenError);
        });
    });
});
