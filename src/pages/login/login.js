var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { DriversProvider } from '../../providers/drivers/drivers';
import { Storage } from '@ionic/storage';
import { HomePage } from '../home/home';
var LoginPage = /** @class */ (function () {
    function LoginPage(navCtrl, drivers, storage) {
        this.navCtrl = navCtrl;
        this.drivers = drivers;
        this.storage = storage;
    }
    LoginPage.prototype.login = function () {
        // this.navCtrl.push(HomePage);
        var _this = this;
        // login
        this.drivers.loginDriver(this.email, this.password).subscribe(function (data) {
            var resp = data.json();
            if (resp.code == 200) {
                _this.storage.set('user', resp.data[0]);
                _this.navCtrl.push(HomePage);
            }
            else if (resp.code == 300) {
                console.log('Wrong Password');
            }
            else if (resp.code == 400) {
                console.log('Wrong username');
            }
        }, function (err) {
            if (err.status == 404) {
                console.log('Not found');
            }
        }, function () { return console.log('Login complete'); });
        console.log('Email: ' + this.email + ' - Pass: ' + this.password);
    };
    LoginPage = __decorate([
        Component({
            selector: 'page-login',
            templateUrl: 'login.html',
            providers: [DriversProvider]
        }),
        __metadata("design:paramtypes", [NavController, DriversProvider, Storage])
    ], LoginPage);
    return LoginPage;
}());
export { LoginPage };
//# sourceMappingURL=login.js.map