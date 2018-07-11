import './polyfills';

import 'prismjs';
import 'prismjs/prism';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-scss';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-csharp';

import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .then(ref => {
    if (window['ngRef']) {
      window['ngRef'].destroy();
    }

    window['ngRef'] = ref;
  })
  .catch(err => console.error(err));
