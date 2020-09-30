import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  loadedFeature = 'recipe';

  // Overwrites the loadedFeature variable with the parameter given by the click event in the app-header
  onNavigate(feature: string) {
    this.loadedFeature = feature;
  }
}
