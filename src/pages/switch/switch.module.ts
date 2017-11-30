import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SwitchPage } from './switch';
import { SignaturePadModule } from 'angular2-signaturepad';

@NgModule({
  declarations: [
    SwitchPage,
  ],
  imports: [
    IonicPageModule.forChild(SwitchPage),
    SignaturePadModule
  ],
})
export class SwitchPageModule {}
