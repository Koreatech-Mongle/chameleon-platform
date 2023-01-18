import {findUserByID} from "../controller/UserController";
import {local} from "./Local";
import * as passport from 'passport'
// TODO: 바꿀 것 import

export function passportConfig(){
    passport.serializeUser((user:any, done) => {
        console.log('serial')
        // router의 req.login 요청이 들어오면 실행된다.
        // 역할: 서버 메모리를 아끼기 위해 많은 사용자 정보 중에서 필요한 부분만 메모리에 저장하도록함. (여기에서는 id)
        // 서버쪽에 [{ id: 3, cookie: 'asvxzc' }] 저장, cookie는 프론트로 보냄
        return done(null, user.id);
    });

    passport.deserializeUser(async (id:any, done) => {
        console.log('deserial')
        try {
            const user = findUserByID(id)
            return done(null, user); // 불러온 user 정보는 req.user에 저장
        } catch (e) {
            console.error(e);
            return done(e);
        }
    });
    local();
}