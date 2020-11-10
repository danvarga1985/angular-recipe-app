import {NgModule} from '@angular/core';
import {AlertComponent} from './alert/alert.component';
import {LoadingSpinnerComponent} from './loading-spinner/loading-spinner.component';
import {DropdownDirective} from './dropdown.directive';
import {CommonModule} from '@angular/common';

@NgModule({
  declarations: [
    AlertComponent,
    LoadingSpinnerComponent,
    DropdownDirective
  ],
  imports: [
    CommonModule
  ],
  // Won't be used here, but in the modules that import SharedModule. Exporting these Components and Modules makes them accessible.
  exports: [
    AlertComponent,
    LoadingSpinnerComponent,
    DropdownDirective,
    CommonModule // Used instead of Browser module.
  ]
})
export class SharedModule {

}
