import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SwitchPage } from './switch';

@NgModule({
  declarations: [
    SwitchPage,
  ],
  imports: [
    IonicPageModule.forChild(SwitchPage),
  ],
})
export class SwitchPageModule {}
