/*
 * PageTest.ts
 * 测试页面
 * luleyan
 */

const { ccclass, property } = cc._decorator;

import PageBase from 'scripts/PageBase';
import featureModelDict from 'configs/FeatureModelDict';
import { Feature } from 'scripts/Memory';

@ccclass
export default class PageTest extends PageBase {
    onPageShow() {
        this.ctrlr.setTitle('测试');
        this.ctrlr.setBackBtnEnabled(true);
    }

    testFeatures() {
        for (const key in featureModelDict) {
            if (!featureModelDict.hasOwnProperty(key)) continue;
            const featureModel = featureModelDict[key];
            let newFeature = new Feature();
            newFeature.id = featureModel.id;
            newFeature.setDatas(1);
            cc.log(
                'feature1 ',
                key,
                featureModel.getInfo(newFeature.datas),
                newFeature.datas,
                JSON.stringify(featureModel.dataAreas)
            );
        }
        cc.log('^_^!1');
        for (const key in featureModelDict) {
            if (!featureModelDict.hasOwnProperty(key)) continue;
            const featureModel = featureModelDict[key];
            let newFeature = new Feature();
            newFeature.id = featureModel.id;
            newFeature.setDatas(10);
            cc.log(
                'feature10 ',
                key,
                featureModel.getInfo(newFeature.datas),
                newFeature.datas,
                JSON.stringify(featureModel.dataAreas)
            );
        }
    }
}
