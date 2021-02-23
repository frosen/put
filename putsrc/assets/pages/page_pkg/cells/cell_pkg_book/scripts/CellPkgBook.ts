/*
 * CellPkgBook.ts
 * 道具列表中的书卷项目
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import { BookModelDict } from '../../../../../configs/BookModelDict';
import { FeatureModelDict } from '../../../../../configs/FeatureModelDict';
import { BookModel } from '../../../../../scripts/DataModel';
import { Book } from '../../../../../scripts/DataSaved';
import { FeatureTool } from '../../../../../scripts/Memory';
import { CellPkgCnsum } from '../../../scripts/CellPkgCnsum';

@ccclass
export class CellPkgBook extends CellPkgCnsum {
    @property(cc.Label)
    detail: cc.Label = null!;

    setData(itemIdx: number, book: Book) {
        super.setData(itemIdx, book);

        const bookModel = BookModelDict[book.id];
        this.setModelData(bookModel);

        this.setCount(book.count);
    }

    setDataByModel(itemIdx: number, bookModel: BookModel, count: number) {
        super.setData(itemIdx, null);
        this.setModelData(bookModel);
        this.setCount(count);
    }

    setModelData(bookModel: BookModel) {
        this.nameLbl.string = bookModel.cnName;

        const featureModel = FeatureModelDict[bookModel.featureId];
        const datas = FeatureTool.getDatas(bookModel.featureId, 1);
        const info = featureModel.getInfo(datas);
        this.detail.string = `${featureModel.cnBrief}：${info}`;
    }
}
