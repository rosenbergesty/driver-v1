import { NgModule } from '@angular/core';
import { SecondsPipe } from './seconds/seconds';
import { MilesPipe } from './miles/miles';
@NgModule({
	declarations: [SecondsPipe,
    MilesPipe],
	imports: [],
	exports: [SecondsPipe,
    MilesPipe]
})
export class PipesModule {}
