import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {CotacaoComponent} from './cotacao.component';

const routes: Routes = [
  {path: '', component: CotacaoComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CotacaoRoutingModule {}
