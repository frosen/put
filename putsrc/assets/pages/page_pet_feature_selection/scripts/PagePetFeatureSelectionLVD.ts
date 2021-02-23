/*
 * PagePetFeatureSelectionLVD.ts
 * 特性列表页面列表的代理
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { ListViewDelegate } from '../../../scripts/ListViewDelegate';
import { ListView } from '../../../scripts/ListView';
import { ListViewCell } from '../../../scripts/ListViewCell';
import { PagePetFeatureSelection } from './PagePetFeatureSelection';
import { CellFeature } from '../../page_pet_detail/cells/cell_feature/scripts/CellFeature';

@ccclass
export class PagePetFeatureSelectionLVD extends ListViewDelegate {
    @property(cc.Prefab)
    featurePrefab: cc.Prefab = null;

    page: PagePetFeatureSelection;

    numberOfRows(listView: ListView): number {
        return this.page.features.length;
    }

    cellIdForRow(listView: ListView, rowIdx: number): string {
        return 'f';
    }

    createCellForRow(listView: ListView, rowIdx: number, cellId: string): ListViewCell {
        const cell = cc.instantiate(this.featurePrefab).getComponent(CellFeature);
        cell.clickCallback = this.page.onCellClick.bind(this.page);
        return cell;
    }

    setCellForRow(listView: ListView, rowIdx: number, cell: CellFeature) {
        const feature = this.page.features[rowIdx];
        const gainType = this.page.gainTypes[rowIdx];
        cell.setData(feature, gainType);
    }
}
