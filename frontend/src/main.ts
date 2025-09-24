import { bootstrapApplication } from "@angular/platform-browser"
import { provideRouter } from "@angular/router"
import { provideHttpClient, withInterceptorsFromDi } from "@angular/common/http"
import { provideAnimations } from "@angular/platform-browser/animations"
import { importProvidersFrom } from "@angular/core"
import { MatSnackBarModule } from "@angular/material/snack-bar"

import { AppComponent } from "./app/app.component"
import { routes } from "./app/app.routes"

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
    provideAnimations(),
    importProvidersFrom(MatSnackBarModule),
  ],
}).catch((err) => console.error(err))
