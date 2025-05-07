class AiServicesController < ApplicationController

  before_action :authorize_global, only: [:enhance]
  before_action :authorize_global, only: [:generate_subtasks]

  def enhance
    input = params[:text]
    
    # Validate input
    if input.blank?
      render json: { error: 'Text input is required' }, status: :bad_request
      return
    end

    begin
      # Make the HTTP request to the ai microservice
      response = HTTParty.post(
        "http://aitextfeature-backend:5000/api/ai/improve-text", 
        body: { userText: input }.to_json,
        headers: { 'Content-Type' => 'application/json' }
      )

      # Check if the response is successful
      if response.success?
        improved_text = response.parsed_response["improvedText"]
        
        # Check if "improvedText" exists in the response
        if improved_text
          render json: { improvedText: improved_text }
        else
          render json: { error: 'Improved text not found in the response' }, status: :unprocessable_entity
        end
      else
        render json: { error: 'Failed to enhance text', details: response.body }, status: :bad_request
      end
    rescue StandardError => e
      # Catch any other exceptions and log them
      Rails.logger.error("Error calling external API: #{e.message}")
      render json: { error: 'Error contacting the ai microservice' }, status: :internal_server_error
    end
  end

  def generate_subtasks
    input = params[:text]
    
    # Validate input
    if input.blank?
      render json: { error: 'Text input is required' }, status: :bad_request
      return
    end

    begin
      # Make the HTTP request to the ai microservice
      response = HTTParty.post(
        "http://aitextfeature-backend:5000/api/ai/generate-subtasks",
        body: { parentTask: input }.to_json,
        headers: { 'Content-Type' => 'application/json' }
      )

      # Check if the response is successful
      if response.success?
        subtasks = response.parsed_response["subtasks"]
        
        # Check if "subtasks" exists in the response
        if subtasks
          render json: { subtasks: subtasks }
        else
          render json: { error: 'Subtasks not found in the response' }, status: :unprocessable_entity
        end
      else
        render json: { error: 'Failed to generate subtasks', details: response.body }, status: :bad_request
      end
    rescue StandardError => e
      # Catch any other exceptions and log them
      Rails.logger.error("Error calling external API: #{e.message}")
      render json: { error: 'Error contacting the ai microservice' }, status: :internal_server_error
    end
  end
end
