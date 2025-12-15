const express = require('express');
const auth = require('../../middlewares/auth');
const chartHelperController = require('../../controllers/chart-helper.controller');

const router = express.Router();

// Helper routes for easy chart management
router.get('/chart-types', auth(), chartHelperController.getChartTypes);
router.get('/datasets', auth(), chartHelperController.getDatasets);
router.get('/pages', auth(), chartHelperController.getPages);
router.get('/datasets/:datasetId/columns', auth(), chartHelperController.getDatasetColumns);
router.get('/datasets/:datasetId/suggestions', auth(), chartHelperController.getChartSuggestions);
router.post('/preview', auth(), chartHelperController.previewChart);

module.exports = router;
