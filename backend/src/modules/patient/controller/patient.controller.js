const logger = require('../../../common/utils/logger');
const successRes = require('../../../common/success');

const PatientService = require('../service/patient.service');

// GET /api/patient
// Query: search, status, page, limit
const getListController = async (req, res) => {
    try {
        logger.debug('Get patient list request', {
            context: 'PatientController.getListController',
            query: req.query
        });

        const { data, pagination } = await PatientService.getListService(req.query);

        return new successRes.GetListSuccess(
            data,
            pagination,
            'Patients retrieved successfully'
        ).send(res);

    } catch (error) {
        logger.error('Error get patient list', {
            context: 'PatientController.getListController',
            message: error.message,
        });
        throw error;
    }
};

module.exports = { getListController };
