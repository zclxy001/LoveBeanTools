//@flow
import React, { Component, Element } from 'react';
import { Icon, Button, message} from 'antd';
import MTReturnMoneyItem from '../component/MTReturnMoneyItem';
import '../css/MTReturnSaveContainer.css';
import type {Value as MTReturnMoneyItemValue} from '../component/MTReturnMoneyItem';
import type {Dispatch} from '../actions/types';
import {setDeducPointAmount, computeDeductPointSaveAmount, addDeducPointAmount, deleteDeducPointAmount, setRuleDeducePoint} from '../actions';
import type {State as DeductPointAmountMap } from '../reducer/deductPointAmount';
import type {SubState as DeductPointAmountItem } from '../reducer/deductPointAmount';
import type {State as DeductPointSaveAmountMap} from '../reducer/deductPointSaveAmount';
import validateDecorator from '../higherOrderComponent/ValidateDecorator';


type Props = {
    deductPointSaveAmount: DeductPointSaveAmountMap,
    deductPointAmount :DeductPointAmountMap,
    dispatch: Dispatch,
}

class MTReturnSaveContainer extends Component {
    props: Props;

    validateStatus: boolean = false;

    render() {
        this.validateStatus = true;
        const keys: number[] = this.props.deductPointSaveAmount.keys;
        const formItems: Element<any>[] = keys.map((key, index) => {
            return (
                <div>
                    {index === 0 ? (
                        <h3>打款明细</h3>
                    ) : null}

                    {validateDecorator(this.props.deductPointAmount[key], (props: DeductPointAmountItem) => {
                        if (!props) {
                            this.validateStatus = false;
                            return (<span style={{color: 'red'}}>请输入打款明细或删除该明细！</span>)
                        } else if (!props.actualAmount) {
                            this.validateStatus = false;
                            return (<span style={{color: 'red'}}>请输入打款金额或删除该明细！</span>)
                        } else if (isNaN(props.actualAmount)) {
                            this.validateStatus = false;
                            return (<span style={{color: 'red'}}>请输入有效的打款金额或删除该明细！</span>)
                        } else  if (!props.deductPoint){
                            this.validateStatus = false;
                            return (<span style={{color: 'red'}}>请输入折扣点或删除该明细！</span>)
                        } else if (isNaN(props.deductPoint)) {
                            this.validateStatus = false;
                            return (<span style={{color: 'red'}}>请输入有效的折扣点或删除该明细！</span>)
                        }else  if ( Number(props.actualAmount) > 9999) {
                            return (<span style={{color: 'gray'}}>打款金额约{(Number(props.actualAmount)/10000).toFixed(2)}万</span>)
                        } else {
                            return null;
                        }
                    })(<span>
                        <MTReturnMoneyItem value={this.props.deductPointAmount[key]} onChange={(value) => {
                            this.props.dispatch(setDeducPointAmount(key,value.deductPoint,value.actualAmount));
                        }}/>
                        {keys.length > 1 ? (
                            <Icon
                                className="dynamic-delete-button"
                                type="minus-circle-o"
                                disabled={keys.length === 1}
                                onClick={() => this.remove(key)}
                            />
                        ) : null}
                    </span>)}
                </div>
            );
        });

        this
        return (
            <div>
                <p>
                    <span style={{fontSize: 20, marginRight: 10}}>正常扣点:</span>
                    <input value={this.props.deductPointSaveAmount.ruleDeducePoint} placeholder="正常扣点额度" onChange={(e) => {this.setRuleDeducePoint(e.target.value)}}/>
                    <span style={{marginLeft: 5}}>%</span>
                    <span style={{fontSize: 20, marginLeft: 50, marginRight: 10}}>节省金额:</span>
                    <input readOnly={true} value={this.props.deductPointSaveAmount.saveAmount} style={(this.props.deductPointSaveAmount.saveAmount && this.props.deductPointSaveAmount.saveAmount > 0) ? {color: 'green'}: {color: 'black'}}/>
                    <span style={{marginLeft: 5}}>元</span>
                </p>
                {formItems}
                <Button type="dashed" onClick={this.add} style={{ width: '60%' }}>
                    <Icon type="plus" /> 新增一项
                </Button>
                <p> {''} </p>
                <Button type="primary" htmlType="submit" style={{ width: '60%'}}  onClick={this.onSubmit}>计算</Button>
            </div>
        );
    }

    //event
    //提交
    onSubmit = (e: Event): void => {
        if (Object.keys(this.props.deductPointAmount).count === 0) {
            message.error('请至少输入一条打款明细！');
            return;
        } else if (this.validateStatus === false) {
            message.error('请删除无效的打款明细！');
            return;
        } else if (!this.props.deductPointSaveAmount.ruleDeducePoint) {
            message.error('请输入正常折扣点数！');
            return;
        }
        let items: DeductPointAmountMap = this.props.deductPointAmount;
        this.props.dispatch(computeDeductPointSaveAmount(Object.values(items)));
        message.success('计算完毕！');
    };
    //添加一个新的
    add = (): void => {
        this.props.dispatch(addDeducPointAmount());
    };

    //删除指定的一条
    remove = (k: number): void => {
        this.props.dispatch(deleteDeducPointAmount(k));
    };
    //输入正常扣点额度
    setRuleDeducePoint(text: ?string): void {
        this.props.dispatch(setRuleDeducePoint(text));
    }

    //明细输入内容的验证规则
    validatorMTReturnMoneyItemValue = (rule: any, value: MTReturnMoneyItemValue, callback: (error: ?string)=>void) => {
        if  (value === undefined) {
            callback('请输入打款明细，或者删除该明细！');
            return;
        } else if (!value.actualAmount && !value.deductPoint) {
            callback('请输入打款明细，或者删除该明细！');
            return;
        } else if (!value.actualAmount) {
            callback('请输入打款金额');
            return;
        } else if (!value.deductPoint) {
            callback('请输入扣点');
            return;
        }
        callback();
    };

}

export default MTReturnSaveContainer;