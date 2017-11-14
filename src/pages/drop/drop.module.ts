import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { DropPage } from './drop';

@NgModule({
  declarations: [
    DropPage,
  ],
  imports: [
    IonicPageModule.forChild(DropPage),
  ],
})
export class DropPageModule {}
