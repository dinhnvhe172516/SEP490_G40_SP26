const AccountModel = require('../models/account.model');
const ProfileModel = require("../models/profile.model");
const PatientModel = require("../../../modules/patient/model/patient.model");
const { Staff: StaffModel } = require("../../../modules/staff/models/index.model");
const logger = require('../../../common/utils/logger');


const findAccountById = async (id) => {
    if (!id) return null;
    try {
        return await AccountModel.findById(accountId).lean();
    } catch (error) {
        logger.debug("Error get account by id", {
            error: error
        });
        return null;
    }
}

const findStaffByAccountId = async (accountId) => {
    try {
        const account = findAccountById(accountId);
        const staff = await StaffModel.findOne({ account_id: accountId });
        const profile = await ProfileModel.findOne({ account_id: accountId });

        return {account, staff, profile};
    } catch (error) {
        logger.debug("Error get account by id", {
            error: error
        });
        return null;
    }
};

const findPatientByAccountId = async (accountId) => {
    try {
        const account = findAccountById(accountId);
        const patient = await PatientModel.findOne({ account_id: accountId });
        const profile = await ProfileModel.findOne({ account_id: accountId });
        
        return {account, patient, profile}
    } catch (error) {
        logger.debug("Error get account by id", {
            error: error
        });
        return null;
    }
};

module.exports = {
    findStaffByAccountId,
    findPatientByAccountId,
    findAccountById
};