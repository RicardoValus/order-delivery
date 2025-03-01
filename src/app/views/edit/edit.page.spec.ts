import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditPage } from './edit.page';
import { ActivatedRoute, Router } from '@angular/router';
import { SqliteService } from 'src/app/services/sqlite.service';
import { Location } from '@angular/common';
import { of } from 'rxjs';

describe('EditPage', () => {
  let component: EditPage;
  let fixture: ComponentFixture<EditPage>;
  let sqliteServiceMock: any;
  let routerMock: any;
  let locationMock: any;
  let activatedRouteMock: any;

  beforeEach(async () => {
    sqliteServiceMock = {
      getItemById: jasmine.createSpy('getItemById').and.returnValue(Promise.resolve({
        id: 1, name: 'Test Item', address: 'Test Address', status: 'pendente'
      })),
      update: jasmine.createSpy('update').and.returnValue(Promise.resolve(1))
    };

    routerMock = {
      navigate: jasmine.createSpy('navigate')
    };

    locationMock = {
      back: jasmine.createSpy('back')
    };

    activatedRouteMock = {
      snapshot: { paramMap: { get: jasmine.createSpy('get').and.returnValue('1') } }
    };

    await TestBed.configureTestingModule({
      declarations: [EditPage],
      providers: [
        { provide: SqliteService, useValue: sqliteServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: Location, useValue: locationMock },
        { provide: ActivatedRoute, useValue: activatedRouteMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EditPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load item on ngOnInit', async () => {
    await component.ngOnInit();
    expect(sqliteServiceMock.getItemById).toHaveBeenCalledWith(1);
    expect(component.name).toBe('Test Item');
    expect(component.address).toBe('Test Address');
    expect(component.status).toBe('pendente');
  });

  it('should update item on save', async () => {
    component.id = 1;
    component.name = 'Updated Item';
    component.address = 'Updated Address';
    component.status = 'entregue';
    await component.save();
    expect(sqliteServiceMock.update).toHaveBeenCalledWith(1, 'Updated Item', 'Updated Address', 'entregue');
    expect(routerMock.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should navigate back on back()', () => {
    component.back();
    expect(locationMock.back).toHaveBeenCalled();
  });

  it('should log error if id is undefined on save', () => {
    spyOn(console, 'error');
    component.id = undefined as any;
    component.save();
    expect(console.error).toHaveBeenCalledWith('erro: id indefinido');
  });
});