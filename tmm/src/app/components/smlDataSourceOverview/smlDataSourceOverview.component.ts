import { Component, OnInit } from '@angular/core';
import { smlTenantMetadataSample, smlTenantMetadataEmpty } from '../layout/smlTenantMetadataEditor/jsonEditorSchema.configuration';
import { ActivatedRoute, Params } from '@angular/router';
import { TmmConfigService } from '../layout/smlTenantMetadataEditor/tmmconfig.service';

@Component({
  selector: 'datasource-overview',
  template: `
    <div class="container">
        <h1 class="text-center"> Data Source for {{ tenantMetadata.tenantId }} </h1>
        <hr />
        <div *ngIf="editDataSourceForm">
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
                        <select> 
                            <option value="true" [selected]="editDataSourceObject.active == true"> True</option>
                            <option value="false" [selected]="editDataSourceObject.active == false">False</option>
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
                <h3> Properties </h3>
            </div>
            <div class="col">
                <h3> Edit </h3>
            </div>
            <div class="col">
                <h3> Delete </h3>
            </div>
        </div>

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
                {{ dataSource.properties }} 
            </div> 
            <div class="col">
                <button class="btn btn-outline-primary btn-block" (click)="EditDataSourceObject(dataSource)">Edit</button> 
            </div> 
            <div class="col">
                <button class="btn btn-outline-danger btn-block" (click)="EditDataSourceObject(dataSource)">Delete</button> 
            </div> 
        </div>
    </div>
  `,

  /*      id: '10-23-1',
      name: 'Test Data Set 01',
      type: 'TestMockData',
      active: true,
      properties: ['Test', 'Doga', 'Is', 'AWesome'] */

  styleUrls: ['./smlDataSourceOverview.component.css']
})
export class smlDataSourceOverview implements OnInit {
    tenantMetadata: any =  smlTenantMetadataSample;
    editDataSourceObject: any;
    editDataSourceForm: boolean = false;

    constructor(
        private activatedRoute: ActivatedRoute, 
        private tmmConfigService: TmmConfigService) {
            this.getTenantMetadata();
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
              this.tenantMetadata.tenantId = params['tenantId'];
              this.tenantMetadata.dataSets = response[0].dataSets;
              this.tenantMetadata.name = response[0].name;
              // this.tenantMetadata = response[0];
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
      console.log(dataSource);
  }

  addNewProperty() {
      this.editDataSourceObject.properties.push('');
  }
}
