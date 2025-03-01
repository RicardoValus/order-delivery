import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('../app/views/home/home.module').then(m => m.HomePageModule)
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'edit',
    loadChildren: () => import('./views/edit/edit.module').then(m => m.EditPageModule)
  },
  {
    path: 'edit/:id',
    loadChildren: () => import('./views/edit/edit.module').then(m => m.EditPageModule)
  },
  {
    path: 'item-details',
    loadChildren: () => import('./views/item-details/item-details.module').then(m => m.ItemDetailsPageModule)
  },
  {
    path: 'item-details/:id',
    loadChildren: () => import('./views/item-details/item-details.module').then(m => m.ItemDetailsPageModule)
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
