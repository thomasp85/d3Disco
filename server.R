
# This is the server logic for a Shiny web application.
# You can find out more about building applications with Shiny here:
# 
# http://www.rstudio.com/shiny/
#

library(shiny)

shinyServer(function(input, output, session) {
    data <- reactive({
        
        invalidateLater(round(1000*rnorm(1)), session)
        
        list(
            x=runif(1, -0.5, 0.5),
            y=runif(1, -0.5, 0.5),
            radius=runif(1),
            colour=list(
                r=round(runif(1)*255),
                g=round(runif(1)*255),
                b=round(runif(1)*255)
                ),
            exit=sample(c('shrink', 'fade', 'explode', 'leave'), 1)
            )
    }) 
    
    output$plot <- reactive({data()})
})
