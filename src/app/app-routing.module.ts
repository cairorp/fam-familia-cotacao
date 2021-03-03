import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  { path: '', loadChildren: () => import('./pages/cotacao/cotacao.module').then(m => m.CotacaoModule)},
  { path: '**', loadChildren: () => import('./pages/cotacao/cotacao.module').then(m => m.CotacaoModule)}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
