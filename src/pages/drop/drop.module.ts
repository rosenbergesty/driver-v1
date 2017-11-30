import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { DropPage } from './drop';
import { SignaturePadModule } from 'angular2-signaturepad';

@NgModule({
  declarations: [
    DropPage,
  ],
  imports: [
    IonicPageModule.forChild(DropPage), 
    SignaturePadModule
  ],
})
export class DropPageModule {}
