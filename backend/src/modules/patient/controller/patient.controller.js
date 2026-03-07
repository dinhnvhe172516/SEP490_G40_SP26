const logger = require('../../../common/utils/logger');
const successRes = require('../../../common/success');

const PatientService = require('../service/patient.service');

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

// GET /api/patient/:id
const getByIdController = async (req, res) => {
    try {
        const { id } = req.params;
        logger.debug('Get patient by id request', {
            context: 'PatientController.getByIdController',
            id
        });

        const patient = await PatientService.getPatientById(id);

        return new successRes.GetDetailSuccess(
            patient,
            'Patient retrieved successfully'
        ).send(res);

    } catch (error) {
        logger.error('Error get patient by id', {
            context: 'PatientController.getByIdController',
            message: error.message,
        });
        throw error;
    }
};

module.exports = { getListController, getByIdController };
