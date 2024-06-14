import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: [
    <% if(headers){ %>
    {
      [`<%= schemaPath %>`]: {
        headers: <%- JSON.stringify(headers) %>,
      },
    },
     <% } else{ %>  
    `<%= schemaPath %>`
    <% } %>
  ],
  documents: <%- JSON.stringify(documentPaths) %>,
  generates: {
    "<%= outputPath %>": {
      plugins: ["typescript", "typescript-operations"],
    },
  },
};
export default config;
