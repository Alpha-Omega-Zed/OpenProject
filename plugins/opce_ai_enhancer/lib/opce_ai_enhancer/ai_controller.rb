# lib/opce_ai_services/ai_controller.rb
module OpceAiServices
    class AiController < ::ApplicationController
      before_action :require_login
  
      def enhance
        input = params[:text]
        response = HTTParty.post("http://localhost:8000/enhance", body: { text: input }.to_json, headers: { 'Content-Type' => 'application/json' })
        render json: { improvedText: response.parsed_response["improvedText"] }
      end

      def generate_subtasks
        input = params[:text]
        response = HTTParty.post("http://localhost:8000/gensub", body: { text: input }.to_json, headers: { 'Content-Type' => 'application/json' })
        render json: { subtasks: response.parsed_response["subtasks"] }
      end
    end
  end
  