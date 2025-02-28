import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CapacitorSQLite, JsonSQLite, capSQLiteChanges, capSQLiteValues } from '@capacitor-community/sqlite';
import { Device } from '@capacitor/device';
import { Preferences } from '@capacitor/preferences';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SqliteService {

  public dbReady: BehaviorSubject<boolean>
  public isWeb: boolean
  public dbName: string


  constructor(
    private http: HttpClient
  ) {
    this.dbReady = new BehaviorSubject(false);
    this.isWeb = false;
    this.dbName = '';
  }

  async init() {
    const info = await Device.getInfo();
    const sqlite = CapacitorSQLite as any;

    if (info.platform == 'android') {
      try {
        await sqlite.requestPermission();
      } catch (error) {
        console.error('esse app precisa de permissão')
      }

    } else if (info.platform == 'web') {
      this.isWeb = true;
      await sqlite.initWebStore();

    }

    this.setupDatabase();
  }

  async setupDatabase() {
    const dbSetup = await Preferences.get({
      key: 'first_setup_key'
    })
    if (!dbSetup.value) {
      this.downloadDatabase();
    } else {
      this.dbName = await this.getDbName();
      await CapacitorSQLite.createConnection({ database: this.dbName });
      await CapacitorSQLite.open({ database: this.dbName });
      this.dbReady.next(true);
    }
  }

  downloadDatabase() {
    this.http.get('assets/db/db.json').subscribe(async (jsonExport: JsonSQLite) => {
      try {
        const jsonstring = JSON.stringify(jsonExport);
        const isValid = await CapacitorSQLite.isJsonValid({ jsonstring });

        if (isValid.result) {
          this.dbName = jsonExport.database;
          await CapacitorSQLite.importFromJson({ jsonstring });
          await CapacitorSQLite.createConnection({ database: this.dbName });
          await CapacitorSQLite.open({ database: this.dbName });

          await Preferences.set({ key: 'first_setup_key', value: '1' });
          await Preferences.set({ key: 'dbname', value: this.dbName });

          this.dbReady.next(true);
        } else {
          console.error('JSON inválido');
        }
      } catch (error) {
        console.error('erro ao processar o JSON:', error);
      }
    }, error => {
      console.error('erro ao carregar o JSON:', error);
    });
  }

  async getDbName() {
    if (!this.dbName) {
      const dbname = await Preferences.get({ key: 'dbname' })
      if (dbname.value) {
        this.dbName = dbname.value
      }
    }
    return this.dbName;
  }

  async create(name: string, address: string, status: string = "pendente") {
    let sql = 'INSERT INTO items (name, address, status) VALUES (?, ?, ?)';
    const dbName = await this.getDbName();
    return CapacitorSQLite.executeSet({
      database: dbName,
      set: [{ statement: sql, values: [name, address, status] }]
    }).then((changes: capSQLiteChanges) => {
      if (this.isWeb) {
        CapacitorSQLite.saveToStore({ database: dbName });
      }
      return changes;
    }).catch(err => Promise.reject(err));
  }

  async read() {
    let sql = 'SELECT * FROM items';
    const dbName = await this.getDbName();
    return CapacitorSQLite.query({
      database: dbName,
      statement: sql,
      values: []
    }).then((response: capSQLiteValues) => {
      return response.values;
    }).catch(err => Promise.reject(err));
  }

  async update(id: number, name: string, address: string, status: string) {
    let sql = 'UPDATE items SET name=?, address=?, status=? WHERE id=?';
    const dbName = await this.getDbName();
    console.log("executando SQL:", sql, "com valores:", [name, address, status, id]);

    return CapacitorSQLite.executeSet({
      database: dbName,
      set: [{ statement: sql, values: [name, address, status, id] }]
    }).then((changes: capSQLiteChanges) => {
      console.log("mudanças no banco:", changes);
      if (this.isWeb) {
        CapacitorSQLite.saveToStore({ database: dbName });
      }
      return changes;
    }).catch(err => {
      console.error("erro ao atualizar no banco:", err);
      return Promise.reject(err);
    });
  }

  async delete(id: number) {
    let sql = 'DELETE FROM items WHERE id=?';
    const dbName = await this.getDbName();
    return CapacitorSQLite.executeSet({
      database: dbName,
      set: [{ statement: sql, values: [id] }]
    }).then((changes: capSQLiteChanges) => {
      if (this.isWeb) {
        CapacitorSQLite.saveToStore({ database: dbName });
      }
      return changes;
    }).catch(err => Promise.reject(err));
  }

  async getItemById(id: number) {
    let sql = 'SELECT * FROM items WHERE id = ?';
    const dbName = await this.getDbName();
    return CapacitorSQLite.query({
      database: dbName,
      statement: sql,
      values: [id]
    }).then((response: capSQLiteValues) => {
      return response.values.length > 0 ? response.values[0] : null;
    }).catch(err => Promise.reject(err));
  }
}