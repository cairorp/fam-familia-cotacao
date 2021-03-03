import {NgModule} from '@angular/core';
import {CotacaoRoutingModule} from './cotacao-routing.module';
import {CotacaoComponent} from './cotacao.component';
import {NzGridModule} from 'ng-zorro-antd/grid';
import {NzFormModule} from 'ng-zorro-antd/form';
import {NzBreadCrumbModule} from 'ng-zorro-antd/breadcrumb';
import {NzIconModule} from 'ng-zorro-antd/icon';
import {NzInputModule} from 'ng-zorro-antd/input';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NzSelectModule} from 'ng-zorro-antd/select';
import {NzDividerModule} from 'ng-zorro-antd/divider';
import {NzSpinModule} from 'ng-zorro-antd/spin';
import {CommonModule} from '@angular/common';
import {NzDatePickerModule} from 'ng-zorro-antd/date-picker';
import {NzSliderModule} from 'ng-zorro-antd/slider';
import {NzInputNumberModule} from 'ng-zorro-antd/input-number';
import {NzCheckboxModule} from 'ng-zorro-antd/checkbox';
import {NzWaveModule} from 'ng-zorro-antd/core/wave';
import {NzButtonModule} from 'ng-zorro-antd/button';
import {LoginComponent} from './component/login/login.component';
import {NzLayoutModule} from 'ng-zorro-antd/layout';

@NgModule({
  imports: [CotacaoRoutingModule, NzGridModule, NzFormModule, NzBreadCrumbModule, NzIconModule, NzInputModule, ReactiveFormsModule, NzSelectModule, NzDividerModule, FormsModule, NzSpinModule, CommonModule, NzDatePickerModule, NzSliderModule, NzInputNumberModule, NzCheckboxModule, NzWaveModule, NzButtonModule, NzLayoutModule],
  declarations: [CotacaoComponent, LoginComponent],
  exports: [CotacaoComponent, LoginComponent]
})
export class CotacaoModule { }
