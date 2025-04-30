# lib/opce_ai_services/engine.rb

module OpceAiServices
    class Engine < ::Rails::Engine
      engine_name :opce_ai_services
  
      initializer 'opce_ai_services.append_migrations' do |app|
        unless app.root.to_s.match? root.to_s
          config.paths['db/migrate'].expanded.each do |expanded_path|
            app.config.paths['db/migrate'] << expanded_path
          end
        end
      end
    end
  end
  