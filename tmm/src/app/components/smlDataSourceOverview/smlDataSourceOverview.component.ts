import { Component, OnInit } from '@angular/core';
import { smlTenantMetadataSample, smlTenantMetadataEmpty } from '../layout/smlTenantMetadataEditor/jsonEditorSchema.configuration';
import { ActivatedRoute, Params } from '@angular/router';
import { TmmConfigService } from '../layout/smlTenantMetadataEditor/tmmconfig.service';
import * as FileSaver from 'file-saver';

@Component({
  selector: 'datasource-overview',
  template: `
    <div class="container-fluid">
        <h2 class="text-center"> Data Sources for {{ tenantMetadata.tenantId }} </h2>
        <button class="btn btn-primary" role="button" routerLink="/dev/{{tenantMetadata.tenantId}}">Back</button>
        <hr />
        <div *ngIf="editDataSourceForm">
          <form #editedForm>
            <div class="row">
                <div class="col-4">
                    <label> Name
                        <input type="text" value="{{ editDataSourceObject.name }}">
                    </label>
                </div>
                <div class="col-4">
                    <label for> Type
                        <input type="text" #editDataSourceObject.type value="{{ editDataSourceObject.type }}">
                    </label>
                </div> 
                <div class="col-4">
                    <label> Active
                      <select name="activeStatusSelection" id="statusSelection" [(ngModel)]="selectedStatus">
                      <option *ngFor="let option of bools"
                              [value]="option" >
                          {{option}}
                        </option>
                      </select>
                    </label>
                </div>
            </div>
            <h2>Properties</h2>
            <div class="row">    
                <div class="col-4" *ngFor="let prop of editDataSourceObject.properties">
                    <input type="text" value="{{ prop }}">                 
                </div>
            </div>
            <button class="btn btn-primary" (click)="addNewProperty()">Add Another Property</button>
            <button class="btn btn-primanry" (click)="saveEditedItem(editedForm)">Save</button>
          </form>
        
        <hr />
        </div>
        <div class="row">
            <div class="col">
                <h3> Data Source </h3>
            </div>
            <div class="col">
                <h3> Type </h3>
            </div>
            <div class="col">
                <h3> Active </h3>
            </div>
            <div class="col">
                <h3> ID </h3>
            </div>
            <div class="col">
                <h3> Delete </h3>
            </div>
          <div class="col">
            <h3> Reset </h3>
          </div>
          <div class="col">
            <h3> Download Credentials </h3>
          </div>
        </div>
        <!-- this should be datasource instead of dataSources-->
        <div class="row" *ngFor="let dataSource of tenantMetadata.dataSource">
            <div class="col">
                {{ dataSource.name }}
            </div>
            <div class="col">
                {{ dataSource.type }}
            </div>
            <div class="col">
                {{ (dataSource.active)? 'Active' : 'Not Active' }}
            </div>
            <div class="col">
                {{ dataSource.id }} 
            </div> 
            <div class="col">
                <button class="btn btn-outline-danger btn-block" (click)="DeleteDataSourceObject(dataSource)">Delete</button> 
            </div>
          <div class="col">
            <button class="btn btn-outline-primary btn-block" (click)="ResetDataSourceObject(dataSource)">Reset</button>
          </div>
          <div class="col">
            <button class="btn btn-outline-primary btn-block" (click)="DownloadCredentials(dataSource)">Download Credentials</button>
          </div>
        </div>
    </div>
  `,
  styleUrls: ['./smlDataSourceOverview.component.css']
})
export class smlDataSourceOverview implements OnInit {
    tenantMetadata: any =  smlTenantMetadataSample;
    editDataSourceObject: any;
    editDataSourceForm: boolean = false;
    bools: any = [true, false];
    statusOptions: string[] = ['enable', 'disable'];
    selectedStatus: boolean;
    constructor(
        private activatedRoute: ActivatedRoute,
        private tmmConfigService: TmmConfigService) {
            this.getTenantMetadata();
            this.selectedStatus = true;
    }

    ngOnInit() {
    }

    getTenantMetadata() {
    this.activatedRoute.params.subscribe((params: Params) => {
      this.tenantMetadata.tenantId = params['tenantId'];
      this.tmmConfigService.getTenantMetadata(this.tenantMetadata.tenantId).then(data => {
        if (data && data._body) {
          try {
            let response = JSON.parse(data._body);

            if (response.length != 0) {
              this.tenantMetadata = response[0];
            }
          } catch (err) {
            console.log(err);
          }
        }
      });
    });
  }

  EditDataSourceObject(dataSource) {
      this.editDataSourceObject = dataSource;
      this.editDataSourceForm = true;
      console.log("Editing: " + this.editDataSourceObject.name);
  }

  DeleteDataSourceObject(dataSource) {
    this.editDataSourceObject = dataSource;
    if (confirm('Are you sure you want to delete: ' + dataSource.name)){
      console.log("Deleting: " + this.editDataSourceObject.name);
      this.tmmConfigService.deleteDataSourceByDataSourceId(this.tenantMetadata.tenantId, this.editDataSourceObject.id).then(data => {
        if(data && data.status == 200) {
          console.log(data);
          this.getTenantMetadata()
        } else {
          alert('Error Deleting ' + dataSource.name)
        }
      });
    }
  }

  ResetDataSourceObject(dataSource){
    this.editDataSourceObject = dataSource;
    if (confirm('Are you sure you want to reset: ' + dataSource.name)){
      console.log("Resetting: " + this.editDataSourceObject.name);
      this.tmmConfigService.resetDataSourceActivationKey(this.tenantMetadata.tenantId, this.editDataSourceObject.id, this.tenantMetadata).then(data => {
        if(data && data.status == 200) {
          console.log(data);
          this.getTenantMetadata();
        } else {
          alert('Error Resetting ' + dataSource.name)
        }
      });
    }
  }

  DownloadCredentials(dataSource) {
    this.editDataSourceObject = dataSource;
    console.log("Downloading: " + this.editDataSourceObject.name);

    let data = this.tmmConfigService.getDataSourceCredential(this.tenantMetadata.tenantId, dataSource);
    if (data) {
      const blob = new Blob([data], { type: 'text/csv' });
      FileSaver.saveAs(blob, 'MCDP_Access.key');
    }
  }

  addNewProperty() {
      this.editDataSourceObject.properties.push('');
  }

  saveEditedItem(editedForm) {
      console.log(editedForm.getElementsByTagName('input'));
      console.log(this.selectedStatus);
    }
}

