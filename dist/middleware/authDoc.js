"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
function authDocProducao(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { host } = req.headers;
        const { senha } = req.body;
        if (host !== undefined) {
            if (host.includes("localhost")) {
                // if the dom is localhost, the server dont ask for the password
                return next();
            }
            //O usuario digitou a senha certa
            if (senha === process.env.SWAGGER_SENHA_DOC ||
                req.originalUrl !== "/doc/") {
                // if the 
                return next();
            }
            //O usuario digitou asenha errada
            if (senha !== process.env.SWAGGER_SENHA_DOC &&
                senha !== undefined /* Necessário para dar o start no formulário */) {
                res.status(401).set("Content-Type", "text/html"); // aqui retornaremos o status code 401 e estamos dizendo que vamos retornar um texto html
                res.send(Buffer.from(`
        <!DOCTYPE html>
      <form method="post">
        <p style="color: red;">Senha incorreta.</p>
        <label for="senha">Seha da Documentação:</label>
        <input type="password" name="senha" id="senha" />
      </form> 
         `));
                //este send é pra enviar algo como resposta
            }
            else {
                //Usuário que ainda não digitou a senha e está em modo produção
                res.status(200).set("Content-Type", "text/html"); // aqui retornaremos o status code 401 e estamos dizendo que vamos retornar um texto html
                res.send(Buffer.from(`
        <!DOCTYPE html>
      <form method="post">
        <label for="senha">Seha da Documentação:</label>
        <input type="password" name="senha" id="senha" />
      </form>

    `));
            }
        }
    });
}
exports.default = authDocProducao;
