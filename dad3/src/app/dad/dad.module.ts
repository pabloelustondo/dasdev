import { NgModule }                 from '@angular/core';
import { ChartsModule }             from 'ng2-charts/ng2-charts';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule }   from '@angular/router';
import { DadChartComponent } from "./chart.component";
import { DadWidgetComponent } from "./widget.component";
import { DadConfigComponent }   from './configuration.component';
import { DadTableComponent }   from './table.component';
import { DadComponent }       from './dashboard.component';
import { DadRoutingModule }   from './dad-routing.module';
import { CommonModule } from '@angular/common'; //<-- This one
import { DropdownModule } from 'ng2-bootstrap';

//Local Storage
let LocalStorageServiceConfig = {
    prefix: 'DataAnalytics',
    storageType: 'sessionStorage'
};

@NgModule({
    imports: [
        DadRoutingModule,
        ChartsModule,
        CommonModule,
        FormsModule,
        HttpModule,
        DropdownModule
    ],
    declarations: [ DadComponent, DadChartComponent, DadConfigComponent,
        DadWidgetComponent, DadTableComponent ]
})
export class DadModule { }
