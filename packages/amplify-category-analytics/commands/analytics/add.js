const fs = require('fs');

const subcommand = 'add';
const category = 'analytics';
const servicesMetadata = JSON.parse(fs.readFileSync(`${__dirname}/../../provider-utils/supported-services.json`));

let options;

module.exports = {
  name: subcommand,
  run: async (context) => {
    const { amplify } = context;

    return amplify.serviceSelectionPrompt(context, category, servicesMetadata)
      .then((result) => {
        options = {
          service: result.service,
          providerPlugin: result.providerName,
        };
        const providerController = require(`../../provider-utils/${result.providerName}/index`);
        if (!providerController) {
          context.print.error('Provider not confgiured for this category');
          return;
        }
        return providerController.addResource(context, category, result.service);
      })
      .then(resourceName => amplify.updateamplifyMetaAfterResourceAdd(
        category,
        resourceName,
        options,
      ))
      .then(() => context.print.success('Successfully added resource'))
      .catch((err) => {
        context.print.info(err.stack);
        context.print.error('There was an error adding the analytics resource');
      });
  },
};
