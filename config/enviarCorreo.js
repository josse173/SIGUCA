var nodemailer = require('nodemailer');

module.exports = { enviar : function (de, para, titulo, tituloCuerpo, cuerpo ) {

        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'rsoto07.2@gmail.com',
                pass: 'Qwerty123!'
            }
        });

        var mailOptions = {
            from: de,
            to: para,
            subject: titulo,
            html: '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">\n' +
                '<html xmlns="http://www.w3.org/1999/xhtml">\n' +
                '\n' +
                '<head>\n' +
                '  <meta http-equiv="Content-Type" content="text/html; charset=utf-8">\n' +
                '  <meta name="viewport" content="width=device-width">\n' +
                '  <title>Title</title>\n' +
                '</head>\n' +
                '\n' +
                '<body style="-moz-box-sizing: border-box; -ms-text-size-adjust: 100%; -webkit-box-sizing: border-box; -webkit-text-size-adjust: 100%; Margin: 0; box-sizing: border-box; color: #0a0a0a; font-family: Helvetica, Arial, sans-serif; font-size: 16px; font-weight: normal; line-height: 1.3; margin: 0; min-width: 100%; padding: 0; text-align: left; width: 100% !important;">\n' +
                '  <style>\n' +
                '    @media only screen {\n' +
                '      html {\n' +
                '        min-height: 100%;\n' +
                '        background: #f3f3f3;\n' +
                '      }\n' +
                '    }\n' +
                '    \n' +
                '    @media only screen and (max-width: 596px) {\n' +
                '      .small-float-center {\n' +
                '        margin: 0 auto !important;\n' +
                '        float: none !important;\n' +
                '        text-align: center !important;\n' +
                '      }\n' +
                '      .small-text-center {\n' +
                '        text-align: center !important;\n' +
                '      }\n' +
                '      .small-text-left {\n' +
                '        text-align: left !important;\n' +
                '      }\n' +
                '      .small-text-right {\n' +
                '        text-align: right !important;\n' +
                '      }\n' +
                '    }\n' +
                '    \n' +
                '    @media only screen and (max-width: 596px) {\n' +
                '      .hide-for-large {\n' +
                '        display: block !important;\n' +
                '        width: auto !important;\n' +
                '        overflow: visible !important;\n' +
                '        max-height: none !important;\n' +
                '        font-size: inherit !important;\n' +
                '        line-height: inherit !important;\n' +
                '      }\n' +
                '    }\n' +
                '    \n' +
                '    @media only screen and (max-width: 596px) {\n' +
                '      table.body table.container .hide-for-large,\n' +
                '      table.body table.container .row.hide-for-large {\n' +
                '        display: table !important;\n' +
                '        width: 100% !important;\n' +
                '      }\n' +
                '    }\n' +
                '    \n' +
                '    @media only screen and (max-width: 596px) {\n' +
                '      table.body table.container .callout-inner.hide-for-large {\n' +
                '        display: table-cell !important;\n' +
                '        width: 100% !important;\n' +
                '      }\n' +
                '    }\n' +
                '    \n' +
                '    @media only screen and (max-width: 596px) {\n' +
                '      table.body table.container .show-for-large {\n' +
                '        display: none !important;\n' +
                '        width: 0;\n' +
                '        mso-hide: all;\n' +
                '        overflow: hidden;\n' +
                '      }\n' +
                '    }\n' +
                '    \n' +
                '    @media only screen and (max-width: 596px) {\n' +
                '      table.body img {\n' +
                '        width: auto;\n' +
                '        height: auto;\n' +
                '      }\n' +
                '      table.body center {\n' +
                '        min-width: 0 !important;\n' +
                '      }\n' +
                '      table.body .container {\n' +
                '        width: 95% !important;\n' +
                '      }\n' +
                '      table.body .columns,\n' +
                '      table.body .column {\n' +
                '        height: auto !important;\n' +
                '        -moz-box-sizing: border-box;\n' +
                '        -webkit-box-sizing: border-box;\n' +
                '        box-sizing: border-box;\n' +
                '        padding-left: 16px !important;\n' +
                '        padding-right: 16px !important;\n' +
                '      }\n' +
                '      table.body .columns .column,\n' +
                '      table.body .columns .columns,\n' +
                '      table.body .column .column,\n' +
                '      table.body .column .columns {\n' +
                '        padding-left: 0 !important;\n' +
                '        padding-right: 0 !important;\n' +
                '      }\n' +
                '      table.body .collapse .columns,\n' +
                '      table.body .collapse .column {\n' +
                '        padding-left: 0 !important;\n' +
                '        padding-right: 0 !important;\n' +
                '      }\n' +
                '      td.small-1,\n' +
                '      th.small-1 {\n' +
                '        display: inline-block !important;\n' +
                '        width: 8.33333% !important;\n' +
                '      }\n' +
                '      td.small-2,\n' +
                '      th.small-2 {\n' +
                '        display: inline-block !important;\n' +
                '        width: 16.66667% !important;\n' +
                '      }\n' +
                '      td.small-3,\n' +
                '      th.small-3 {\n' +
                '        display: inline-block !important;\n' +
                '        width: 25% !important;\n' +
                '      }\n' +
                '      td.small-4,\n' +
                '      th.small-4 {\n' +
                '        display: inline-block !important;\n' +
                '        width: 33.33333% !important;\n' +
                '      }\n' +
                '      td.small-5,\n' +
                '      th.small-5 {\n' +
                '        display: inline-block !important;\n' +
                '        width: 41.66667% !important;\n' +
                '      }\n' +
                '      td.small-6,\n' +
                '      th.small-6 {\n' +
                '        display: inline-block !important;\n' +
                '        width: 50% !important;\n' +
                '      }\n' +
                '      td.small-7,\n' +
                '      th.small-7 {\n' +
                '        display: inline-block !important;\n' +
                '        width: 58.33333% !important;\n' +
                '      }\n' +
                '      td.small-8,\n' +
                '      th.small-8 {\n' +
                '        display: inline-block !important;\n' +
                '        width: 66.66667% !important;\n' +
                '      }\n' +
                '      td.small-9,\n' +
                '      th.small-9 {\n' +
                '        display: inline-block !important;\n' +
                '        width: 75% !important;\n' +
                '      }\n' +
                '      td.small-10,\n' +
                '      th.small-10 {\n' +
                '        display: inline-block !important;\n' +
                '        width: 83.33333% !important;\n' +
                '      }\n' +
                '      td.small-11,\n' +
                '      th.small-11 {\n' +
                '        display: inline-block !important;\n' +
                '        width: 91.66667% !important;\n' +
                '      }\n' +
                '      td.small-12,\n' +
                '      th.small-12 {\n' +
                '        display: inline-block !important;\n' +
                '        width: 100% !important;\n' +
                '      }\n' +
                '      .columns td.small-12,\n' +
                '      .column td.small-12,\n' +
                '      .columns th.small-12,\n' +
                '      .column th.small-12 {\n' +
                '        display: block !important;\n' +
                '        width: 100% !important;\n' +
                '      }\n' +
                '      table.body td.small-offset-1,\n' +
                '      table.body th.small-offset-1 {\n' +
                '        margin-left: 8.33333% !important;\n' +
                '        Margin-left: 8.33333% !important;\n' +
                '      }\n' +
                '      table.body td.small-offset-2,\n' +
                '      table.body th.small-offset-2 {\n' +
                '        margin-left: 16.66667% !important;\n' +
                '        Margin-left: 16.66667% !important;\n' +
                '      }\n' +
                '      table.body td.small-offset-3,\n' +
                '      table.body th.small-offset-3 {\n' +
                '        margin-left: 25% !important;\n' +
                '        Margin-left: 25% !important;\n' +
                '      }\n' +
                '      table.body td.small-offset-4,\n' +
                '      table.body th.small-offset-4 {\n' +
                '        margin-left: 33.33333% !important;\n' +
                '        Margin-left: 33.33333% !important;\n' +
                '      }\n' +
                '      table.body td.small-offset-5,\n' +
                '      table.body th.small-offset-5 {\n' +
                '        margin-left: 41.66667% !important;\n' +
                '        Margin-left: 41.66667% !important;\n' +
                '      }\n' +
                '      table.body td.small-offset-6,\n' +
                '      table.body th.small-offset-6 {\n' +
                '        margin-left: 50% !important;\n' +
                '        Margin-left: 50% !important;\n' +
                '      }\n' +
                '      table.body td.small-offset-7,\n' +
                '      table.body th.small-offset-7 {\n' +
                '        margin-left: 58.33333% !important;\n' +
                '        Margin-left: 58.33333% !important;\n' +
                '      }\n' +
                '      table.body td.small-offset-8,\n' +
                '      table.body th.small-offset-8 {\n' +
                '        margin-left: 66.66667% !important;\n' +
                '        Margin-left: 66.66667% !important;\n' +
                '      }\n' +
                '      table.body td.small-offset-9,\n' +
                '      table.body th.small-offset-9 {\n' +
                '        margin-left: 75% !important;\n' +
                '        Margin-left: 75% !important;\n' +
                '      }\n' +
                '      table.body td.small-offset-10,\n' +
                '      table.body th.small-offset-10 {\n' +
                '        margin-left: 83.33333% !important;\n' +
                '        Margin-left: 83.33333% !important;\n' +
                '      }\n' +
                '      table.body td.small-offset-11,\n' +
                '      table.body th.small-offset-11 {\n' +
                '        margin-left: 91.66667% !important;\n' +
                '        Margin-left: 91.66667% !important;\n' +
                '      }\n' +
                '      table.body table.columns td.expander,\n' +
                '      table.body table.columns th.expander {\n' +
                '        display: none !important;\n' +
                '      }\n' +
                '      table.body .right-text-pad,\n' +
                '      table.body .text-pad-right {\n' +
                '        padding-left: 10px !important;\n' +
                '      }\n' +
                '      table.body .left-text-pad,\n' +
                '      table.body .text-pad-left {\n' +
                '        padding-right: 10px !important;\n' +
                '      }\n' +
                '      table.menu {\n' +
                '        width: 100% !important;\n' +
                '      }\n' +
                '      table.menu td,\n' +
                '      table.menu th {\n' +
                '        width: auto !important;\n' +
                '        display: inline-block !important;\n' +
                '      }\n' +
                '      table.menu.vertical td,\n' +
                '      table.menu.vertical th,\n' +
                '      table.menu.small-vertical td,\n' +
                '      table.menu.small-vertical th {\n' +
                '        display: block !important;\n' +
                '      }\n' +
                '      table.menu[align="center"] {\n' +
                '        width: auto !important;\n' +
                '      }\n' +
                '      table.button.small-expand,\n' +
                '      table.button.small-expanded {\n' +
                '        width: 100% !important;\n' +
                '      }\n' +
                '      table.button.small-expand table,\n' +
                '      table.button.small-expanded table {\n' +
                '        width: 100%;\n' +
                '      }\n' +
                '      table.button.small-expand table a,\n' +
                '      table.button.small-expanded table a {\n' +
                '        text-align: center !important;\n' +
                '        width: 100% !important;\n' +
                '        padding-left: 0 !important;\n' +
                '        padding-right: 0 !important;\n' +
                '      }\n' +
                '      table.button.small-expand center,\n' +
                '      table.button.small-expanded center {\n' +
                '        min-width: 0;\n' +
                '      }\n' +
                '    }\n' +
                '  </style>\n' +
                '  <!-- <style> -->\n' +
                '  <table class="body" data-made-with-foundation="" style="Margin: 0; background: #eff1f0; border-collapse: collapse; border-spacing: 0; color: #0a0a0a; font-family: Helvetica, Arial, sans-serif; font-size: 16px; font-weight: normal; height: 100%; line-height: 1.3; margin: 0; padding: 0; text-align: left; vertical-align: top; width: 100%;">\n' +
                '    <tbody>\n' +
                '      <tr style="padding: 0; text-align: left; vertical-align: top;">\n' +
                '        <td class="float-center" style="-moz-hyphens: auto; -webkit-hyphens: auto; Margin: 0 auto; border-collapse: collapse !important; color: #0a0a0a; float: none; font-family: Helvetica, Arial, sans-serif; font-size: 16px; font-weight: normal; hyphens: auto; line-height: 1.3; margin: 0 auto; padding: 0; text-align: center; vertical-align: top; word-wrap: break-word;"\n' +
                '          valign="top" align="center">\n' +
                '          <center data-parsed="" style="min-width: 580px; width: 100%;">\n' +
                '            <!-- move the above styles into your custom stylesheet -->\n' +
                '            <table class="wrapper header float-center" style="Margin: 0 auto; border-collapse: collapse; border-spacing: 0; float: none; margin: 0 auto; padding: 0; text-align: center; vertical-align: top; width: 100%; background-color:#004277" bgcolor="#8a8a8a" align="center">\n' +
                '              <tbody>\n' +
                '                <tr style="padding: 0; text-align: left; vertical-align: top;">\n' +
                '                  <td class="wrapper-inner" style="-moz-hyphens: auto; -webkit-hyphens: auto; Margin: 0; border-collapse: collapse !important; color: #0a0a0a; font-family: Helvetica, Arial, sans-serif; font-size: 16px; font-weight: normal; hyphens: auto; line-height: 1.3; margin: 0; padding: 20px; text-align: left; vertical-align: top; word-wrap: break-word;">\n' +
                '                    <table class="container" style="Margin: 0 auto; background: #8a8a8a; border-collapse: collapse; border-spacing: 0; margin: 0 auto; padding: 0; text-align: inherit; vertical-align: top; width: 580px;" align="center">\n' +
                '                      <tbody>\n' +
                '                        <tr style="padding: 0; text-align: left; vertical-align: top;">\n' +
                '                          <td style="-moz-hyphens: auto; -webkit-hyphens: auto; Margin: 0; border-collapse: collapse !important; color: #0a0a0a; font-family: Helvetica, Arial, sans-serif; font-size: 16px; font-weight: normal; hyphens: auto; line-height: 1.3; margin: 0; padding: 0; text-align: left; vertical-align: top; word-wrap: break-word;">\n' +
                '                            <table class="row collapse" style="border-collapse: collapse; border-spacing: 0; display: table; padding: 0; position: relative; text-align: left; vertical-align: top; width: 100%;">\n' +
                '                              <tbody>\n' +
                '                                <tr style="padding: 0; text-align: left; vertical-align: top;">\n' +
                '                                  <th class="small-6 large-6 columns first" style="Margin: 0 auto; background-color: #004277; color: #0a0a0a; font-family: Helvetica, Arial, sans-serif; font-size: 16px; font-weight: normal; line-height: 1.3; margin: 0 auto; padding: 0; padding-bottom: 0; padding-left: 0; padding-right: 0; text-align: left; width: 298px;"\n' +
                '                                    valign="middle">\n' +
                '                                    <table style="border-collapse: collapse; border-spacing: 0; padding: 0; text-align: left; vertical-align: top; width: 100%;">\n' +
                '                                      <tbody>\n' +
                '                                        <tr style="padding: 0; text-align: left; vertical-align: top;">\n' +
                '                                          <th style="Margin: 0; color: #0a0a0a; font-family: Helvetica, Arial, sans-serif; font-size: 16px; font-weight: normal; line-height: 1.3; margin: 0; padding: 0; text-align: left;"> <img src="http://e-propiedadescr.com/fondo-blanco.png" style="-ms-interpolation-mode: bicubic; clear: both; display: block; max-width: 100%; outline: none; text-decoration: none; width: auto;"> </th>\n' +
                '                                        </tr>\n' +
                '                                      </tbody>\n' +
                '                                    </table>\n' +
                '                                  </th>\n' +
                '                                  <th class="small-6 large-6 columns last" style="Margin: 0 auto; background-color: #004277; color: #0a0a0a; font-family: Helvetica, Arial, sans-serif; font-size: 16px; font-weight: normal; line-height: 1.3; margin: 0 auto; padding: 0; padding-bottom: 0; padding-left: 0; padding-right: 0; text-align: left; width: 298px;"\n' +
                '                                    valign="middle">\n' +
                '                                    <table style="border-collapse: collapse; border-spacing: 0; padding: 0; text-align: left; vertical-align: top; width: 100%;">\n' +
                '                                      <tbody>\n' +
                '                                        <tr style="padding: 0; text-align: left; vertical-align: top;">\n' +
                '                                          <th style="Margin: 0; color: #0a0a0a; font-family: Helvetica, Arial, sans-serif; font-size: 16px; font-weight: normal; line-height: 1.3; margin: 0; padding: 0; text-align: left;">\n' +
                '                                            <h1 style="Margin: 0; Margin-bottom: 10px; color: white; font-family: Helvetica, Arial, sans-serif; font-size: 34px; font-weight: normal; line-height: 1.3; margin: 0; margin-bottom: 0px; padding: 0; text-align: left; word-wrap: normal;">SIGUCA</h1>\n' +
                '                                          </th>\n' +
                '                                        </tr>\n' +
                '                                      </tbody>\n' +
                '                                    </table>\n' +
                '                                  </th>\n' +
                '                                </tr>\n' +
                '                              </tbody>\n' +
                '                            </table>\n' +
                '                          </td>\n' +
                '                        </tr>\n' +
                '                      </tbody>\n' +
                '                    </table>\n' +
                '                  </td>\n' +
                '                </tr>\n' +
                '              </tbody>\n' +
                '            </table>\n' +
                '            <table class="container float-center" style="Margin: 0 auto; background: #fefefe; border-collapse: collapse; border-spacing: 0; float: none; margin: 0 auto; padding: 0; text-align: center; vertical-align: top; width: 580px;" align="center">\n' +
                '              <tbody>\n' +
                '                <tr style="padding: 0; text-align: left; vertical-align: top;">\n' +
                '                  <td style="-moz-hyphens: auto; -webkit-hyphens: auto; Margin: 0; border-collapse: collapse !important; color: #0a0a0a; font-family: Helvetica, Arial, sans-serif; font-size: 16px; font-weight: normal; hyphens: auto; line-height: 1.3; margin: 0; padding: 0; text-align: left; vertical-align: top; word-wrap: break-word;">\n' +
                '                    <table class="spacer" style="border-collapse: collapse; border-spacing: 0; padding: 0; text-align: left; vertical-align: top; width: 100%;">\n' +
                '                      <tbody>\n' +
                '                        <tr style="padding: 0; text-align: left; vertical-align: top;">\n' +
                '                          <td style="-moz-hyphens: auto; -webkit-hyphens: auto; Margin: 0; border-collapse: collapse !important; color: #0a0a0a; font-family: Helvetica, Arial, sans-serif; font-size: 16px; font-weight: normal; hyphens: auto; line-height: 16px; margin: 0; mso-line-height-rule: exactly; padding: 0; text-align: left; vertical-align: top; word-wrap: break-word;"\n' +
                '                            height="16px">&nbsp;</td>\n' +
                '                        </tr>\n' +
                '                      </tbody>\n' +
                '                    </table>\n' +
                '                    <table class="row" style="border-collapse: collapse; border-spacing: 0; display: table; padding: 0; position: relative; text-align: left; vertical-align: top; width: 100%;">\n' +
                '                      <tbody>\n' +
                '                        <tr style="padding: 0; text-align: left; vertical-align: top;">\n' +
                '                          <th class="small-12 large-12 columns first last" style="Margin: 0 auto; color: #0a0a0a; font-family: Helvetica, Arial, sans-serif; font-size: 16px; font-weight: normal; line-height: 1.3; margin: 0 auto; padding: 0; padding-bottom: 16px; padding-left: 16px; padding-right: 16px; text-align: left; width: 564px;">\n' +
                '                            <table style="border-collapse: collapse; border-spacing: 0; padding: 0; text-align: left; vertical-align: top; width: 100%;">\n' +
                '                              <tbody>\n' +
                '                                <tr style="padding: 0; text-align: left; vertical-align: top;">\n' +
                '                                  <th style="Margin: 0; color: #0a0a0a; font-family: Helvetica, Arial, sans-serif; font-size: 16px; font-weight: normal; line-height: 1.3; margin: 0; padding: 0; text-align: left;">\n' +
                '                                    <h1 style="Margin: 0; Margin-bottom: 10px; color: inherit; font-family: Helvetica, Arial, sans-serif; font-size: 34px; font-weight: normal; line-height: 1.3; margin: 0; margin-bottom: 10px; padding: 0; text-align: left; word-wrap: normal;">'+tituloCuerpo+'</h1>                           \n' +
                '                                    <p style="Margin: 0; Margin-bottom: 10px; color: #0a0a0a; font-family: Helvetica, Arial, sans-serif; font-size: 16px; font-weight: normal; line-height: 1.3; margin: 0; margin-bottom: 10px; padding: 0; text-align: left;">'+cuerpo+'</p>                                  \n' +
                '                                  </th>\n' +
                '                                </tr>\n' +
                '                              </tbody>\n' +
                '                            </table>\n' +
                '                          </th>\n' +
                '                        </tr>\n' +
                '                      </tbody>\n' +
                '                    </table>\n' +
                '                    <table class="wrapper secondary" style="background: #f3f3f3; border-collapse: collapse; border-spacing: 0; padding: 0; text-align: left; vertical-align: top; width: 100%;" align="center">\n' +
                '                      <tbody>\n' +
                '                        <tr style="padding: 0; text-align: left; vertical-align: top;">\n' +
                '                          <td class="wrapper-inner" style="-moz-hyphens: auto; -webkit-hyphens: auto; Margin: 0; border-collapse: collapse !important; color: #0a0a0a; font-family: Helvetica, Arial, sans-serif; font-size: 16px; font-weight: normal; hyphens: auto; line-height: 1.3; margin: 0; padding: 0; text-align: left; vertical-align: top; word-wrap: break-word;">\n' +
                '                            <table class="spacer" style="border-collapse: collapse; border-spacing: 0; padding: 0; text-align: left; vertical-align: top; width: 100%;">\n' +
                '                              <tbody>\n' +
                '                                <tr style="padding: 0; text-align: left; vertical-align: top;">\n' +
                '                                  <td style="-moz-hyphens: auto; -webkit-hyphens: auto; Margin: 0; border-collapse: collapse !important; color: #0a0a0a; font-family: Helvetica, Arial, sans-serif; font-size: 16px; font-weight: normal; hyphens: auto; line-height: 16px; margin: 0; mso-line-height-rule: exactly; padding: 0; text-align: left; vertical-align: top; word-wrap: break-word;"\n' +
                '                                    height="16px">&nbsp;</td>\n' +
                '                                </tr>\n' +
                '                              </tbody>\n' +
                '                            </table>\n' +
                '                            <table class="row" style="border-collapse: collapse; border-spacing: 0; display: table; padding: 0; position: relative; text-align: left; vertical-align: top; width: 100%;">\n' +
                '                              <tbody>\n' +
                '                                <tr style="padding: 0; text-align: left; vertical-align: top;">\n' +
                '                                  <th class="small-12 large-6 columns last" style="Margin: 0 auto; color: #0a0a0a; font-family: Helvetica, Arial, sans-serif; font-size: 16px; font-weight: normal; line-height: 1.3; margin: 0 auto; padding: 0; padding-bottom: 16px; padding-left: 8px; padding-right: 16px; text-align: left; width: 274px;">\n' +
                '                                    <table style="border-collapse: collapse; border-spacing: 0; padding: 0; text-align: left; vertical-align: top; width: 100%;">\n' +
                '                                      <tbody>\n' +
                '                                        <tr style="padding: 0; text-align: left; vertical-align: top;">\n' +
                '                                          <th style="Margin: 0; color: #0a0a0a; font-family: Helvetica, Arial, sans-serif; font-size: 16px; font-weight: normal; line-height: 1.3; margin: 0; padding: 0; text-align: left;">\n' +
                '                                            <p style="Margin: 0; Margin-bottom: 10px; color: #0a0a0a; font-family: Helvetica, Arial, sans-serif; font-size: 16px; font-weight: normal; line-height: 1.3; margin: 0; margin-bottom: 10px; padding: 0; text-align: left;">Haga click en el siguiente enlace para ir la sitio:</p>\n' +
                '                                            <p style="Margin: 0; Margin-bottom: 10px; color: #0a0a0a; font-family: Helvetica, Arial, sans-serif; font-size: 16px; font-weight: normal; line-height: 1.3; margin: 0; margin-bottom: 10px; padding: 0; text-align: left;">Sitio: <a href="siguca.mideplan.go.cr" style="Margin: 0; color: #2199e8; font-family: Helvetica, Arial, sans-serif; font-weight: normal; line-height: 1.3; margin: 0; padding: 0; text-align: left; text-decoration: none;">siguca.mideplan.go.cr</a></p>\n' +
                '                                            <a href="siguca.mideplan.go.cr" style="Margin: 0; color: #2199e8; font-family: Helvetica, Arial, sans-serif; font-weight: normal; line-height: 1.3; margin: 0; padding: 0; text-align: left; text-decoration: none;">\n' +
                '                                              <img src="http://e-propiedadescr.com/cintillo-mideplan.png" style="-ms-interpolation-mode: bicubic; border: none; clear: both; display: block; margin-left: -20px; margin-top: -40px; max-width: 100%; outline: none; text-decoration: none; width: auto;"\n' +
                '                                                height="100">\n' +
                '                                            </a>\n' +
                '                                          </th>\n' +
                '                                        </tr>\n' +
                '                                      </tbody>\n' +
                '                                    </table>\n' +
                '                                  </th>\n' +
                '                                </tr>\n' +
                '                              </tbody>\n' +
                '                            </table>\n' +
                '                          </td>\n' +
                '                        </tr>\n' +
                '                      </tbody>\n' +
                '                    </table>\n' +
                '                  </td>\n' +
                '                </tr>\n' +
                '              </tbody>\n' +
                '            </table>\n' +
                '          </center>\n' +
                '        </td>\n' +
                '      </tr>\n' +
                '    </tbody>\n' +
                '  </table>\n' +
                '\n' +
                '\n' +
                '</body>\n' +
                '\n' +
                '</html>\n'
        };

        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });
    }
};
