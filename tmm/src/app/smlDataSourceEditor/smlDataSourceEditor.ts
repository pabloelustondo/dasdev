import {Component, OnInit, Input, ViewChild, EventEmitter, Output} from '@angular/core';
import { SmlDataSource } from '../../sml/sml';
import { JsonEditorComponent, JsonEditorOptions } from 'ng2-jsoneditor';

@Component({
  selector: 'app-editor-smldatasource',
  template: `
    <div>
      <json-editor style="height: 100vh" [options]="editorOptions" [data]="dataSource"></json-editor >
      <br />
      <button id="save" class="btn btn-success" (click)="saveCurrentItem()">Save</button>
      <button id="cancel" class="btn btn-danger" (click)="cancelCurrentItem()">Cancel</button>
    </div>  `,
  styleUrls: ['./smlDataSourceEditor.css']
})

export class smlDataSourceEditor implements OnInit {
  @Input() dataSource: any;

  @Output() optionUpdated = new EventEmitter();

  @ViewChild(JsonEditorComponent) editor: JsonEditorComponent;

  type: string;
  active: boolean;
  properties: any[];
  index: any;

  editorOptions = {
    theme: 'foundation6',
    search: false,
    mode: 'text',
    modes: ['view', 'tree', 'text'],
    onError: ( error ) => {
      console.error(error);
    }
  };

  constructor() {
  }

  ngOnInit() {}

  ngOnChanges() {
    this.index = this.dataSource.index;
    delete this.dataSource.index;
    this.editor.set(this.dataSource);
  }

  cancelCurrentItem() {
    const emptyObject: any = {};
    this.editor.set(emptyObject);
  }

  saveCurrentItem() {
    const a = this.editor.get();
    a['index'] = this.index;
    this.optionUpdated.emit(a);
    this.index = '';
  }
}
