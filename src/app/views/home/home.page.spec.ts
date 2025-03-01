import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule, AlertController, ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
import { HomePage } from './home.page';
import { SqliteService } from '../../services/sqlite.service';
import { of } from 'rxjs';

describe('HomePage', () => {
  let component: HomePage;
  let fixture: ComponentFixture<HomePage>;
  let sqliteServiceMock: any;
  let routerMock: any;
  let alertCtrlMock: any;
  let modalCtrlMock: any;

  beforeEach(async () => {
    sqliteServiceMock = {
      read: jasmine.createSpy('read').and.returnValue(Promise.resolve([])),
      create: jasmine.createSpy('create').and.returnValue(Promise.resolve()),
      update: jasmine.createSpy('update').and.returnValue(Promise.resolve()),
      delete: jasmine.createSpy('delete').and.returnValue(Promise.resolve())
    };

    routerMock = {
      navigate: jasmine.createSpy('navigate')
    };

    alertCtrlMock = {
      create: jasmine.createSpy('create').and.returnValue(Promise.resolve({
        present: jasmine.createSpy('present')
      }))
    };

    modalCtrlMock = {
      dismiss: jasmine.createSpy('dismiss').and.returnValue(Promise.resolve())
    };

    await TestBed.configureTestingModule({
      declarations: [HomePage],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: SqliteService, useValue: sqliteServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: AlertController, useValue: alertCtrlMock },
        { provide: ModalController, useValue: modalCtrlMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HomePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call read on ionViewWillEnter', () => {
    component.ionViewWillEnter();
    expect(sqliteServiceMock.read).toHaveBeenCalled();
  });

  it('should filter items correctly', () => {
    component.items = [
      { id: 1, name: 'Item 1', address: 'Address 1', status: 'pendente' },
      { id: 2, name: 'Item 2', address: 'Address 2', status: 'entregue' }
    ];
    component.filterStatus = 'pendente';
    component.filterItems();
    expect(component.filteredItems.length).toBe(1);
    expect(component.filteredItems[0].status).toBe('pendente');
  });

  it('should call sqlite.create on create', async () => {
    component.name = 'Test Name';
    component.address = 'Test Address';
    component.status = 'pendente';
    await component.create();
    expect(sqliteServiceMock.create).toHaveBeenCalled();
  });

  it('should show alert if name already exists', async () => {
    spyOn(component, 'showAlert');
    component.items = [{ id: 1, name: 'Existing', address: 'Address', status: 'pendente' }];

    component.name = 'Existing';
    component.address = 'Some Address';

    await component.create();
    expect(component.showAlert).toHaveBeenCalledWith('Já existe um pedido com esse nome.');
  });


  it('should navigate to edit page on update', () => {
    const item = { id: 1, name: 'Item', address: 'Address', status: 'pendente' };
    component.update(item);
    expect(routerMock.navigate).toHaveBeenCalledWith(['/edit', item.id]);
  });

  it('should delete an item', async () => {
    await component.delete(1);
    expect(alertCtrlMock.create).toHaveBeenCalled();
  });
});