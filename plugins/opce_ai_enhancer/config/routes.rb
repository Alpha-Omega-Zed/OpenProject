# config/routes.rb
OpceAiServices::Engine.routes.draw do
    post '/enhance_description', to: 'ai#enhance'
  end

OpceAiServices::Engine.routes.draw do
    post '/generate_subtasks', to: 'ai#gensub'
end
  