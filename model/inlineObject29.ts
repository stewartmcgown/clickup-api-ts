/**
 * ClickUp 2.0
 * Let\'s make people more productive, together.  Please use our [feedback board](https://clickup.canny.io) to report bugs, feature requests, and collaborate with the community.  If you\'d like to import our entire API library, click [here](https://t333.s.clickup-attachments.com/t333/3bf59291-47c0-4f1a-ae91-5d9f26a8daca/ClickUp%20API%20V2.postman_collection.json) to download the file needed to import through Postman.  ## Authentication  There are two ways to authenticate with ClickUp API 2.0, with a personal token or creating an application and authenticating with an OAuth2 flow. Once you receive one of those two tokens, use that in the `Authorization` header of your API requests.  **IMPORTANT** - _If you are creating an application for others to use, it is highly recommended that you use the OAuth2 flow._  ### Personal Token  If you are using the API for personal use, it is safe to use the personal API token. You can find this token in your user settings, under the `Apps` section. At the top of the page you have the option to generate a personal token. These tokens will always begin with `pk_`.  ![personal_token](https://attachments3.clickup.com/343f245e-7d27-411d-96d0-9ad3a6f2f8a7/personal_token.png)  If your token becomes compromised, you can regenerate it. However, be aware that any applications that were using the old token will lose access once it has been regenerated.  ### OAuth2 Flow  When you want to develop an application that others can use, you must go through the OAuth2 flow so that every user that uses your application gets assigned an individualized token. This way each user of your application is able to access their own ClickUp resources. If you are unfamiliar with OAuth2, Digital Ocean has put together a great [guide](https://www.digitalocean.com/community/tutorials/an-introduction-to-oauth-2) that should get you started.  ***Note:** ClickUp uses the authorization code grant type.*  #### How To Use the ClickUp OAuth2 Flow  1. **Create An OAuth App** - As an admin, navigate to your team settings and click on the `Integrations` section. Once there, click on the icon that is labeled \"ClickUp API\" and create a new app. When you create an app, you will be prompted to enter a name, and at least one redirect url. When your app is created, you will be provided with a `client_id` and a `secret`.  2. **Authorization Code** - You must first retrieve an authorization code from your user before you can get an access token for their account.    - To start this process, redirect the user to `https://app.clickup.com/api?client_id={client_id}&redirect_uri={redirect_uri}` with the redirect query parameter set to a redirect uri that you specified when creating the oauth app. The host of the redirect uri must match one of those redirect uris or the request will fail. The protocol will default to https if not provided, and non-ssl redirect uris may not be supported in the future.    - Once the user has accepted or rejected the authorization request, they will be redirected back to the `redirect_uri` with the necessary query parameters for getting an access token.  3. **Access Token** - Once you have retrieved the authorization code in the previous step, you can then use the route `POST /api/v2/oauth/token` with the parameters `client_id`, `client_secret` , and `code` to get the user access token. This is the token that is used in the `Authorization` header for all requests in the ClickUp API. Skip to the authorization section below for more information on this route.  4. **Token Teams** - When you redirect your user in step 2 of this flow, they will be prompted which teams (Workspaces) they want to grant you access to. Therefore in order to access a specific Workspace for the user, you need to ensure that they have given you access. You can use the route `GET /api/v2/team` to see which Workspaces they have authorized you to access. If they have not given you access to the appropriate Workspaces, you can redirect them to the authorization code URL from step 2 at any time to reauthorize your app. Below is a screenshot of what the user sees when they visit this URL.  ![token_teams](https://attachments3.clickup.com/49988c04-bf0f-42a5-96cc-82ce213b7f5e/token_teams.png)  ## Rate Limiting  The API is rate limited per OAuth and personal token. You will receive a 429 HTTP status code if you exceed the rate limit. The rate limit varies based on [plan](https://clickup.com/expandplans):  - **Free Forever**, **Unlimited**, and **Business Plan**: 100 requests per minute per token  - **Business Plus Plan**: 1,000 requests per minute per token  - **Enterprise Plan**: 10,000 requests per minute per token  Learn more about our [ClickUp Plans](https://clickup.com/pricing).  ## Error Handling  Errors responses will return a non-200 status code and a json err message and error code.  Common errors include:  **`Team not authorized`**: This error is thrown when a team was not authorized by the user for a particular access token. Refer to the `Token Teams` section of the OAuth instructions for more information on how to fix this error. Error codes that are associated with this message include `OAUTH_023`, `OAUTH_026`, `OAUTH_027`, and `OAUTH_029` to `OAUTH_045`  **`Token not found`**: This error is thrown if authorization is revoked by the user, as described in the \"Personal Token\" section. Error codes that are associated with this message include `OAUTH_019`, `OAUTH_021`, `OAUTH_025`, and `OAUTH_077`  **`Authorization Header Required`**: The authorization token was missing in the `Authorization` http header. `OAUTH_017`  **`Client Not Found`**: The client application was not created correctly. `OAUTH_010`  **`Redirect URI not passed`**: The redirect URI was not present during the OAuth authentication flow. Refer to the section \"Create An OAuth App\" to resolve this error. `OAUTH_017`  **`Redirect URI does not match the redirect uris of this application`**: The redirect URI must be registered with your client application. Refer to the section \"Create An OAuth App\" to resolve this error. `OAUTH_007`  ## FAQ  > What is `team` in reference to?  Teams is the legacy term for what are now called Workspaces in ClickUp. For compatibility, the term `team` is still used in this API to refer to Workspaces. In our API documentation, `team_id` refers to the id of a Workspace, and `group_id` refers to the id of a user group.  > What `Content-Type` should I use?  When formatting your requests to ClickUp, please always use the content type `application/json`. Using form encoded data is not fully supported and can result in unexpected consequences.  > How are projects and Folders related?  Projects are what we used to call Folders in ClickUp V1. If you use the first version of the API, the items that are returned to you as projects are the same as Folders in the second version of the API. You must use the correct nomenclature depending on the version of the API you are using (`project` for V1 and `folder` for V2) and cannot interchange them.  > Does the access token returned from `POST /api/v2/oauth/token` expire?  The access token does not expire at this time.  > Is it possible to move a task between lists using the API?  It is not possible to move a task between lists at this time. This is a complicated process, however we hope to implement this on the public API in the near future.  > Will tasks created via API generate notifications?  Yes, all actions you take with the public api will trigger all of the same process that would occur through the UI. This includes notifications, websocket messages, webhooks, etc.  > How do I tell who has access to a particular task?  To get a list of team members that have access to a particular task or list, use the routes `GET /api/v2/task/{{task_id}}/member` and `GET /api/v2/list/{{list_id}}/member` under the \"Members\" section of this documentation.  > How are dates formatted in ClickUp?  ClickUp will always display dates in [Unix time](https://en.wikipedia.org/wiki/Unix_time) in milliseconds. You can use a website like [Epoch Converter](https://epochconverter.com) to convert dates between Unix and human readable date formats.  > What timezone does your API use for timestamps?  Our API always returns timestamps in [UTC (Coordinated Universal Time)](https://en.wikipedia.org/wiki/Coordinated_Universal_Time).  > How are subtasks represented in the API?  Subtasks are identical to tasks in every way. Therefore, you can manipulate subtasks the same way you would update any task with the API. To check if a task object is a subtask or not, locate the `parent` property. If this value is `null` then it is not a subtask, otherwise it will contain the task ID of the subtask\'s parent.  To create a subtask, use `POST /api/v2/list/:list_id/task` and make sure to set the `parent` property in the body of the request. Similarly, to update or delete existing subtasks, use the routes `PUT /api/v2/task/:task_id` and `DELETE /api/v2/task/:task_id` respectively. To fetch subtasks, get the parent task and add the subtask query param (`GET /api/v2/task/:parent_id?include_subtasks=true`) or use the search team route with that same query param (`GET /api/v2/team/:team_id/task?subtasks=true`).  > The code examples shown here aren\'t working  Our code examples are automatically generated and may require customization for specific coding languages and implementation. They are included for reference purposes only.
 *
 * The version of the OpenAPI document: 1.0.0
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import { RequestFile } from './models';
import { SpaceSpaceIdTagTag } from './spaceSpaceIdTagTag';

export class InlineObject29 {
    'tags'?: Array<SpaceSpaceIdTagTag>;
    'assignee'?: number;
    'billable'?: boolean;
    'description'?: string;
    'duration'?: number;
    'start'?: number;
    'tid'?: string;

    static discriminator: string | undefined = undefined;

    static attributeTypeMap: Array<{name: string, baseName: string, type: string}> = [
        {
            "name": "tags",
            "baseName": "tags",
            "type": "Array<SpaceSpaceIdTagTag>"
        },
        {
            "name": "assignee",
            "baseName": "assignee",
            "type": "number"
        },
        {
            "name": "billable",
            "baseName": "billable",
            "type": "boolean"
        },
        {
            "name": "description",
            "baseName": "description",
            "type": "string"
        },
        {
            "name": "duration",
            "baseName": "duration",
            "type": "number"
        },
        {
            "name": "start",
            "baseName": "start",
            "type": "number"
        },
        {
            "name": "tid",
            "baseName": "tid",
            "type": "string"
        }    ];

    static getAttributeTypeMap() {
        return InlineObject29.attributeTypeMap;
    }
}

