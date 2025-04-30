import { ChangeDetectionStrategy, Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'wp-enhance-button',
  standalone: true,
  imports: [],
  templateUrl: './wp-enhance-text-button.component.html',
  styleUrl: './wp-enhance-text-button.component.sass',
  template: '(onclick)={enhanceText()}',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class WpEnhanceTextButtonComponent {
  constructor(private http: HttpClient) {}

  enhanceText = () => {
    console.log("Enhancing text!!!")
    this.http.post<{improvedText:string}>('/plugins/opce_ai_services/enhance', {text: "Mock text for now"})
    .subscribe(response => {
      // Show modular popup window
      console.log("Received response '"+response+"'")
    })
  }
}
