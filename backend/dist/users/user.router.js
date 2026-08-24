"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRouter = void 0;
const express_1 = require("express");
const user_controller_1 = require("./user.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const userRouter = (0, express_1.Router)();
exports.userRouter = userRouter;
// Apply authMiddleware globally to all user routes
userRouter.use(auth_middleware_1.authMiddleware);
userRouter.get('/', user_controller_1.getUsers);
userRouter.get('/:id', user_controller_1.getUserById);
userRouter.post('/', user_controller_1.createUser);
userRouter.patch('/:id', user_controller_1.updateUser);
