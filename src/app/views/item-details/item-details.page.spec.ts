import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ItemDetailsPage } from './item-details.page';
import { ActivatedRoute } from '@angular/router';
import { SqliteService } from 'src/app/services/sqlite.service';
import { Location } from '@angular/common';
import { of } from 'rxjs';

describe('ItemDetailsPage', () => {
  let component: ItemDetailsPage;
  let fixture: ComponentFixture<ItemDetailsPage>;
  let sqliteServiceMock: any;
  let locationMock: any;
  let activatedRouteMock: any;

  beforeEach(async () => {
    sqliteServiceMock = {
      getItemById: jasmine.createSpy('getItemById').and.returnValue(Promise.resolve({
        id: 1, name: 'Test Item', address: 'Test Address', status: 'pendente'
      }))
    };

    locationMock = {
      back: jasmine.createSpy('back')
    };

    activatedRouteMock = {
      paramMap: of({ get: (key: string) => (key === 'id' ? '1' : null) })
    };

    await TestBed.configureTestingModule({
      declarations: [ItemDetailsPage],
      providers: [
        { provide: SqliteService, useValue: sqliteServiceMock },
        { provide: Location, useValue: locationMock },
        { provide: ActivatedRoute, useValue: activatedRouteMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ItemDetailsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load item details on ngOnInit', async () => {
    await component.ngOnInit();
    expect(sqliteServiceMock.getItemById).toHaveBeenCalledWith(1);
    expect(component.item).toEqual({
      id: 1, name: 'Test Item', address: 'Test Address', status: 'pendente'
    });
  });

  it('should navigate back on back()', () => {
    component.back();
    expect(locationMock.back).toHaveBeenCalled();
  });
});
