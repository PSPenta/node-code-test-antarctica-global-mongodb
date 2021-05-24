const router = require('express').Router();
const { check, query } = require('express-validator');

const dependencies = require('./routesDependencies');

/**
 * @swagger
 * /login:
 *  post:
 *    tags:
 *      - Authentication
 *    name: Login API
 *    summary: Based on user's data, this api sent jwt token which leads to login process.
 *    consumes:
 *      - application/json
 *    produces:
 *      - application/json
 *    parameters:
 *      - name: Body Data
 *        in: body
 *        schema:
 *         type: object
 *         properties:
 *          email:
 *            type: string
 *          password:
 *            type: string
 *        required:
 *         - email
 *         - password
 *    responses:
 *      200:
 *        description: JWT token will be in response.
 *      500:
 *        description: Internal server error.
 */
router.post(
  '/login',
  [
    check('email').exists().withMessage('The email is mandatory!')
      .isEmail()
      .normalizeEmail(),
    check('password', '...')
      .exists().withMessage('The password is mandatory!')
      .isLength({ min: 8, max: 15 })
      .withMessage('The password length must be between 8 and 15 digits!')
      .matches(/^(?=.*\d)(?=.*[!@#$&*])(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z!@#$&*]{8,15}$/, 'i')
      .withMessage('The password must contain at least 1 uppercase, 1 lowercase, 1 special character and 1 number!')
  ],
  dependencies.controllers.authClient.jwtLogin
);

/**
 * @swagger
 * /logout:
 *  get:
 *    tags:
 *      - Authentication
 *    name: Logout API
 *    summary: This api stores the jwt token into Blacklist table to avoid future usage of it.
 *    consumes:
 *      - application/json
 *    produces:
 *      - application/json
 *    parameters:
 *      - name: Param Data
 *        in: param
 *        schema:
 *          type: object
 *    responses:
 *      200:
 *        description: Success message.
 *      401:
 *        description: Not authenticated.
 *      500:
 *        description: Internal server error.
 */
router.get(
  '/logout',
  dependencies.middlewares.auth.jwtAuth,
  dependencies.controllers.authClient.jwtLogout
);

/**
 * @swagger
 * /register:
 *  post:
 *    tags:
 *      - Authentication
 *    name: User Register API
 *    summary: This API lets user register himself.
 *    consumes:
 *      - application/json
 *    produces:
 *      - application/json
 *    parameters:
 *      - name: Body Data
 *        in: body
 *        schema:
 *          type: object
 *          properties:
 *            firstName:
 *              type: string
 *            lastName:
 *              type: string
 *            email:
 *              type: string
 *            password:
 *              type: string
 *            employeeId:
 *              type: string
 *            organization:
 *              type: string
 *        required:
 *         - firstName
 *         - lastName
 *         - email
 *         - password
 *         - employeeId
 *         - organization
 *    responses:
 *      201:
 *        description: Success message.
 *      404:
 *        description: Something went wrong.
 *      422:
 *        description: Input validation error messages.
 *      500:
 *        description: Internal server error.
 */
router.post(
  '/register',
  [
    check('firstName')
      .exists().withMessage('The firstName is mandatory!')
      .matches(/^[A-Za-z0-9]+$/)
      .withMessage('The firstName must be alphabetic or alphanumeric, and it should not contain spaces!')
      .isLength({ max: 255 })
      .withMessage('The firstName length must be less than 255 digits!'),
    check('lastName')
      .exists().withMessage('The lastName is mandatory!')
      .matches(/^[A-Za-z0-9]+$/)
      .withMessage('The lastName must be alphabetic or alphanumeric, and it should not contain spaces!')
      .isLength({ max: 255 })
      .withMessage('The lastName length must be less than 255 digits!'),
    check('email').exists().withMessage('The email is mandatory!')
      .isEmail()
      .normalizeEmail(),
    check('password', '...')
      .exists()
      .withMessage('The password is mandatory!')
      .isLength({ min: 8, max: 15 })
      .withMessage('The password length must be between 8 and 15 digits!')
      .matches(/^(?=.*\d)(?=.*[!@#$&*])(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z!@#$&*]{8,15}$/, 'i')
      .withMessage('The password must contain at least 1 uppercase, 1 lowercase, 1 special character and 1 number!'),
    check('organization')
      .exists().withMessage('The organization is mandatory!')
      .matches(/^[A-Za-z0-9]+$/)
      .withMessage('The organization must be alphabetic or alphanumeric, and it should not contain spaces!')
      .isLength({ max: 255 })
      .withMessage('The organization length must be less than 255 digits!')
  ],
  dependencies.controllers.authClient.register
);

/**
 * @swagger
 * /users:
 *  get:
 *    tags:
 *      - Others
 *    name: User Listing API
 *    summary: This api provides the List of users.
 *    consumes:
 *      - application/json
 *    produces:
 *      - application/json
 *    parameters:
 *      - name: Param Data
 *        in: param
 *        schema:
 *          type: object
 *          properties:
 *            search:
 *              type: string
 *            sort:
 *              type: string
 *            order:
 *              type: string
 *        required:
 *         - search
 *         - sort
 *         - order
 *    responses:
 *      200:
 *        description: User List.
 *      404:
 *        description: No users found.
 *      422:
 *        description: Input validation error messages.
 *      500:
 *        description: Internal server error.
 */
router.get(
  '/users',
  [
    query('search')
      .matches(/^[A-Za-z0-9]+$/)
      .withMessage('The search field must be alphabetic or alphanumeric, and it should not contain spaces!')
      .isLength({ max: 255 })
      .withMessage('The organization length must be less than 255 digits!')
      .optional({ nullable: true }),
    query('sort')
      .isIn(['firstName', 'lastName', 'email', 'employeeId', 'organization'])
      .withMessage('The sort must contain a valid column name!')
      .optional({ nullable: true }),
    query('order')
      .isIn([-1, 1])
      .withMessage('The order must contain any from -1 and 1!')
      .optional({ nullable: true })
  ],
  dependencies.controllers.others.getUsers
);

module.exports = router;
