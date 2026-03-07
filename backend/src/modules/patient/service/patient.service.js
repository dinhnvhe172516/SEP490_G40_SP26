const PatientModel = require('../model/patient.model');
const ProfileModel = require('../../auth/models/profile.model');
const Pagination = require('../../../common/responses/Pagination');
const logger = require('../../../common/utils/logger');
const errorRes = require('../../../common/errors');

const getListService = async (query) => {
    try {
        const search = query.search?.trim();
        const statusFilter = query.status;
        const page = Math.max(1, parseInt(query.page || 1));
        const limit = Math.max(1, parseInt(query.limit || 10));
        const skip = (page - 1) * limit;

        const matchCondition = {};

        if (statusFilter) {
            matchCondition.status = statusFilter;
        }

        if (search) {
            const regex = { $regex: search, $options: 'i' };
            matchCondition.$or = [
                { 'profile.full_name': regex },
                { 'profile.phone': regex },
                { 'profile.email': regex },
            ];
        }

        const pipeline = [
            {
                $lookup: {
                    from: 'profiles',
                    localField: 'profile_id',
                    foreignField: '_id',
                    as: 'profile'
                }
            },

            {
                $unwind: {
                    path: '$profile',
                    preserveNullAndEmptyArrays: true
                }
            },

            // Lookup account để lấy phone/email cho bệnh nhân đã có tài khoản
            {
                $lookup: {
                    from: 'accounts',
                    localField: 'account_id',
                    foreignField: '_id',
                    as: 'account'
                }
            },
            {
                $unwind: {
                    path: '$account',
                    preserveNullAndEmptyArrays: true
                }
            },

            // Gộp phone/email: ưu tiên lấy từ Profile, nếu null thì lấy từ Account
            {
                $addFields: {
                    'profile.phone': {
                        $ifNull: ['$profile.phone', '$account.phone_number']
                    },
                    'profile.email': {
                        $ifNull: ['$profile.email', '$account.email']
                    }
                }
            },

            { $match: matchCondition },

            {
                $facet: {
                    data: [
                        { $sort: { createdAt: -1 } },
                        { $skip: skip },
                        { $limit: limit },
                        {
                            $project: {
                                _id: 1,
                                patient_code: 1,
                                status: 1,
                                createdAt: 1,
                                'profile._id': 1,
                                'profile.full_name': 1,
                                'profile.phone': 1,
                                'profile.email': 1,
                                'profile.dob': 1,
                                'profile.gender': 1,
                            }
                        }
                    ],
                    totalCount: [
                        { $count: 'count' }
                    ]
                }
            }
        ];

        const result = await PatientModel.aggregate(pipeline);

        const patients = result[0]?.data || [];
        const totalItems = result[0]?.totalCount[0]?.count || 0;

        return {
            data: patients,
            pagination: new Pagination({ page, size: limit, totalItems })
        };

    } catch (error) {
        logger.error('Error getting patient list', {
            context: 'PatientService.getListService',
            message: error.message,
        });
        throw new errorRes.InternalServerError(error.message);
    }
};

module.exports = { getListService };
