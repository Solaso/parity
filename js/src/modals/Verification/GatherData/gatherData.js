// Copyright 2015, 2016 Parity Technologies (UK) Ltd.
// This file is part of Parity.

// Parity is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// Parity is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with Parity.  If not, see <http://www.gnu.org/licenses/>.

import React, { Component, PropTypes } from 'react';
import BigNumber from 'bignumber.js';
import { Checkbox } from 'material-ui';
import InfoIcon from 'material-ui/svg-icons/action/info-outline';
import SuccessIcon from 'material-ui/svg-icons/navigation/check';
import ErrorIcon from 'material-ui/svg-icons/navigation/close';

import { fromWei } from '~/api/util/wei';
import { Form, Input } from '~/ui';
import { nullableProptype } from '~/util/proptypes';

import smsTermsOfService from '~/3rdparty/sms-verification/terms-of-service';
import emailTermsOfService from '~/3rdparty/email-verification/terms-of-service';
import { howSMSVerificationWorks, howEmailVerificationWorks } from '../how-it-works';
import styles from './gatherData.css';

export default class GatherData extends Component {
  static propTypes = {
    fee: React.PropTypes.instanceOf(BigNumber),
    method: PropTypes.string.isRequired,
    fields: PropTypes.array.isRequired,
    isVerified: nullableProptype(PropTypes.bool.isRequired),
    hasRequested: nullableProptype(PropTypes.bool.isRequired),
    setConsentGiven: PropTypes.func.isRequired
  }

  render () {
    const { method, isVerified } = this.props;
    const termsOfService = method === 'email' ? emailTermsOfService : smsTermsOfService;
    const howItWorks = method === 'email' ? howEmailVerificationWorks : howSMSVerificationWorks;

    return (
      <Form>
        { howItWorks }
        { this.renderFee() }
        { this.renderCertified() }
        { this.renderRequested() }
        { this.renderFields() }
        <Checkbox
          className={ styles.spacing }
          label={ 'I agree to the terms and conditions below.' }
          disabled={ isVerified }
          onCheck={ this.consentOnChange }
        />
        <div className={ styles.terms }>{ termsOfService }</div>
      </Form>
    );
  }

  renderFee () {
    const { fee } = this.props;

    if (!fee) {
      return (<p>Fetching the fee…</p>);
    }
    return (
      <div className={ styles.container }>
        <InfoIcon />
        <p className={ styles.message }>The fee is { fromWei(fee).toFixed(3) } ETH.</p>
      </div>
    );
  }

  renderCertified () {
    const { isVerified } = this.props;

    if (isVerified) {
      return (
        <div className={ styles.container }>
          <ErrorIcon />
          <p className={ styles.message }>Your account is already verified.</p>
        </div>
      );
    } else if (isVerified === false) {
      return (
        <div className={ styles.container }>
          <SuccessIcon />
          <p className={ styles.message }>Your account is not verified yet.</p>
        </div>
      );
    }
    return (
      <p className={ styles.message }>Checking if your account is verified…</p>
    );
  }

  renderRequested () {
    const { isVerified, hasRequested } = this.props;

    // If the account is verified, don't show that it has requested verification.
    if (isVerified) {
      return null;
    }

    if (hasRequested) {
      return (
        <div className={ styles.container }>
          <InfoIcon />
          <p className={ styles.message }>You already requested verification.</p>
        </div>
      );
    } else if (hasRequested === false) {
      return (
        <div className={ styles.container }>
          <SuccessIcon />
          <p className={ styles.message }>You did not request verification yet.</p>
        </div>
      );
    }
    return (
      <p className={ styles.message }>Checking if you requested verification…</p>
    );
  }

  renderFields () {
    const { isVerified, fields } = this.props;

    const rendered = fields.map((field) => {
      const onChange = (_, v) => {
        field.onChange(v);
      };
      const onSubmit = field.onChange;
      return (
        <Input
          key={ field.key }
          label={ field.label }
          hint={ field.hint }
          error={ field.error }
          disabled={ isVerified }
          onChange={ onChange }
          onSubmit={ onSubmit }
        />
      );
    });

    return (<div>{rendered}</div>);
  }

  consentOnChange = (_, consentGiven) => {
    this.props.setConsentGiven(consentGiven);
  }
}
