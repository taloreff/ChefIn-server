import User, { IUser } from "../models/userModel";

import BaseController from "./baseController";


class UserController extends BaseController<IUser> {
    constructor() {
        super(User);
    }

}
export default new UserController();