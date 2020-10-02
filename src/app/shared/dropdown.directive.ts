import {Directive, ElementRef, HostBinding, HostListener} from '@angular/core';

@Directive( {
  selector: '[appDropdown]'
})
export class DropdownDirective {
  // Binds to the property of the element the directive is placed on --- what is this "class" ????????????
  @HostBinding('class.open') isOpen = false;

/*
  // Listens to click events on the class the directive was placed on
  @HostListener('click') toggleOpen(): void {
    this.isOpen = !this.isOpen;
  }
*/

  // Dropdown can be closed by clicking anywhere outside of it, as opposed to just clicking inside of it (see above)
  // The listener is placed on the document, instead of the dropdown itself
  @HostListener('document:click', ['$event']) toggleOpen(event: Event): void {
    this.isOpen = this.elRef.nativeElement.contains(event.target) ? !this.isOpen : false;
  }
  constructor(private elRef: ElementRef) {}

}
