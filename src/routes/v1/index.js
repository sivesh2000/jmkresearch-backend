const express = require('express');
const authRoute = require('./auth.route');
const userRoute = require('./user.route');
const docsRoute = require('./docs.route');
const masterRoute = require('./master.route');
const stateRoute = require('./state.route');
const cityRoute = require('./city.route');
const districtRoute = require('./district.route');
const makeRoute = require('./make.route');
const modelRoute = require('./model.route');
const planRoute = require('./plan.route');
const userPlanRoute = require('./user-plan.route');
const planFeaturesRoute = require('./plan-features.route');
const permissionRoute = require('./permission.route');
const thirdPartyRoute = require('./thirdparty.route');
const config = require('../../config/config');
const ticketRoute = require('./ticket.route');
const ticketResponseRoute = require('./ticketResponse.route');
const roleRoute = require('./role.route');
const helpDeskMappingRoute = require('./help-desk-mapping.route');
const rolePermissionRoute = require('./role-permission.route');
const userRole = require('./user-role.route');
const menuRoute = require('./menu.route');
const pageContentRoute = require('./page-content.route');
const configRoute = require('./config.route');
const companyRoute = require('./company.route');
const tenderRoute = require('./tender.route');
const categoryRoute = require('./category.route');
const chartRoute = require('./chart.route');
const chartHelperRoute = require('./chart-helper.route');

const router = express.Router();

const defaultRoutes = [
  { path: '/auth', route: authRoute },
  { path: '/users', route: userRoute },
  { path: '/master', route: masterRoute },
  { path: '/states', route: stateRoute },
  { path: '/cities', route: cityRoute },
  { path: '/districts', route: districtRoute },
  { path: '/makes', route: makeRoute },
  { path: '/models', route: modelRoute },
  { path: '/plans', route: planRoute },
  { path: '/user-plans', route: userPlanRoute },
  { path: '/plan-features', route: planFeaturesRoute },
  { path: '/permissions', route: permissionRoute },
  { path: '/third-party', route: thirdPartyRoute },
  { path: '/tickets', route: ticketRoute },
  { path: '/responses', route: ticketResponseRoute },
  { path: '/roles', route: roleRoute },
  { path: '/help-desk-mapping', route: helpDeskMappingRoute },
  { path: '/role-permission', route: rolePermissionRoute },
  { path: '/user-role', route: userRole },
  { path: '/menus', route: menuRoute },
  { path: '/page-contents', route: pageContentRoute },
  { path: '/configs', route: configRoute },
  { path: '/companies', route: companyRoute },
  { path: '/tenders', route: tenderRoute },
  { path: '/categories', route: categoryRoute },
  { path: '/charts', route: chartRoute },
  { path: '/chart-helpers', route: chartHelperRoute },
];

const devRoutes = [
  // routes available only in development mode
  {
    path: '/docs',
    route: docsRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

/* istanbul ignore next */
if (config.env === 'development') {
  devRoutes.forEach((route) => {
    router.use(route.path, route.route);
  });
}

module.exports = router;
