# plugins/opce_ai_services/init.rb
require_relative 'lib/opce_ai_services/engine'

OpenProject::Plugins::register :opce_ai_services do
  name 'OPCE AI Services'
  author 'Dimitris Sägesser'
  description 'Communicates with an AI microservice for text enhancement, translation, and subtask suggestion'
  version '0.0.1'

  requires_openproject '>= 12.0.0'

  engine ::OpceAiServices::Engine
end
