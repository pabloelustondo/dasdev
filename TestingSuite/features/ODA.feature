Feature: SOTI Insights- ODA Backend Components

        #New ODA endpoints CB-437 and CB-438

  #Scenario: GET Topics
  #  Given I make a GET request to ~/query/topics
  #  And a <testStep> submission with the following request paramaters <testRequest>
  #  Then The response message should not include <testResponse>

  Scenario: As an admininstrator I want to GET a list of existing topics
    Given I set the xaccesskey for ODA
    And I grab ODA port number from globalconfig.json
    When I GET topics
    Then response code must be 200
    Then response body should be error-free
    Then The response message should not include <testResponse>

  #Scenario: valid POST to Query
  #      Given I set valid request header and body for POST call to ~/query
  #      And grab ODA port number from globalconfig.json
  #      And I make a POST call to ~/query
  #      Then response code is :200
  #      Then The response message should contain the merged dataset

  Scenario: As an admininstrator I want to subscribe to a topic
    Given I set valid request header and body for POST call to ~/query with metadata id
    And I grab ODA port number from globalconfig.json
    And I make a POST call to ~/query
    Then response code is :200
    #Further validation is needed
    Then the response dosent have to be merged

  Scenario: invalid POST to Query
      Given I set invalid request header and body for POST call to ~/query
      And I grab ODA port number from globalconfig.json
      And I make a POST call to ~/query
      Then response code is :200
      Then The response message should contain error


