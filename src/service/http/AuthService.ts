import * as express from 'express';
import {Application, Request, Response} from 'express';
import * as bcrypt from 'bcrypt';
import * as passport from 'passport';
import {User} from '../../entities/User';
import {RESPONSE_MESSAGE} from '../../constant/Constants';
import {HTTPService} from '../interfaces/http/HTTPService';
import {Server} from 'http';
import {HTTPLogUtils} from "../../utils/HTTPLogUtils";

export class AuthService extends HTTPService {
    init(app: Application, server: Server) {
        const router = express.Router();
        router.post('/sign-in', HTTPLogUtils.addBeginLogger(this.handleSignIn, '/auths/sign-in'));
        router.post('/sign-up', HTTPLogUtils.addBeginLogger(this.handleSignUp, '/auths/sign-up'));
        router.post('/modify-password', HTTPLogUtils.addBeginLogger(this.handleModifyPassword, '/auths/modify-password'));
        router.delete('/sign-out', HTTPLogUtils.addBeginLogger(this.handleSignOut, '/auths/sign-out'));
        app.use('/auths', router);
    }

    /**
     * provides user sign-up
     * req.body must include { username, password, email}
     * msg : {
     *     401 - non_field_errors
     *     401 - duplicated_email_error
     *     200 - OK
     * }
     * @param {Request} req - Express Request
     * @param {Response} res - Express Response
     * @param {Function} next - Callback Function
     */
    async handleSignUp(req: Request, res: Response, next: Function) {
        if (!(req.body.username && req.body.password && req.body.email)) {
            res.status(401).send(RESPONSE_MESSAGE.NON_FIELD);
            return;
        }

        if (await this.userController.findByEmail(req.body.email)) {
            res.status(401).send(RESPONSE_MESSAGE.DUPLICATED_EMAIL);
            return;
        }
        const {email, username} = req.body;
        const password = await bcrypt.hashSync(req.body.password, await bcrypt.genSaltSync());
        const user: User = new User();
        user.email = email;
        user.username = username;
        user.password = password;
        await this.userController.save(user);
        res.status(200).send(RESPONSE_MESSAGE.OK);
    }

    async handleLegacyInfo(req: Request, res: Response, next: Function) {
        if (req.isAuthenticated()) {
            res.status(200).send((req.user as User).toData());
        } else {
            res.status(401).send(RESPONSE_MESSAGE.NOT_AUTH);
        }
    }

    handleSignIn(req: Request, res: Response, next: Function) {
        passport.authenticate('local', (err, user, info) => {
            if (err) {
                return next(err);
            }
            if (info) {
                return res.status(401).send(info.reason.msg);
            }

            return req.login(user, error => {
                if (error) {
                    return next(error);
                }
                return res.status(200).send(user);
            });
        })(req, res, next);
    }


    async handleModifyPassword(req: Request, res: Response, next: Function) {
        if (!req.isAuthenticated()) {
            return res.status(401).send(RESPONSE_MESSAGE.NOT_AUTH);
        }
        if (!(req.body.password)) {
            return res.status(401).send(RESPONSE_MESSAGE.NON_FIELD);
        }
        const password = await bcrypt.hashSync(req.body.password, await bcrypt.genSaltSync());
        console.log(req.user);
        try {
            const user = new User();
            user.password = password;
            await this.userController.save(user);
            return res.status(200).send(RESPONSE_MESSAGE.OK);
        } catch (e) {
            return res.status(501).send(RESPONSE_MESSAGE.SERVER_ERROR);
        }
    }


    async handleSignOut(req: Request, res: Response, next: Function) {
        let isSessionError = false;

        if (!req.isAuthenticated()) return res.status(401).send(RESPONSE_MESSAGE.NOT_AUTH);
        await req.session.destroy(err => {
            if (err) {
                isSessionError = true;
            }
        });

        if (isSessionError) {
            return res.status(200).send(RESPONSE_MESSAGE.OK);
        } else {
            return res.status(501).send(RESPONSE_MESSAGE.SERVER_ERROR);
        }
    }
}