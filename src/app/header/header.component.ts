import { Component, EventEmitter, Output } from '@angular/core';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html'
})
export class HeaderComponent {
    //Forwards the result of the HTML click event
    @Output() featureSelected = new EventEmitter<string>();
    
    onSelect(feature: string) {
        this.featureSelected.emit(feature);
    }

}