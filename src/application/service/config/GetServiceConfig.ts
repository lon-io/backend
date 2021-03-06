import { ServiceConfigDTO } from '../../../presentation/dtos/config/ServiceConfigDTO';
import { AuthenticationMethodType } from '../../../domain/model/user/AuthenticationMethod';

export class GetServiceConfig {
  constructor(private config: any) {}

  public async execute(): Promise<ServiceConfigDTO> {
    const estonianAuthEnabled = this.config.get('authentication.allowedMethods.estonianId') === 'true';
    const addressRequired = this.config.get('requirements.address') === 'true';
    const appName = this.config.get('app.name');

    return {
      preferredAuthMethod: estonianAuthEnabled
        ? AuthenticationMethodType.ESTONIAN_ID
        : AuthenticationMethodType.MAGIC_LINK,
      defaultLanguage: this.config.get('i18n.defaultLanguage'),
      addressRequired,
      appName,
    };
  }
}
