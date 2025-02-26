class AddIndexesToCustomOptions < ActiveRecord::Migration[7.1]
  def change
    # A previous migration 20230328154645_add_gin_trgm_index_on_journals_and_custom_values
    # already enabled on the extension. Hence we do not attempt to enable it here, just
    # to use it if its available.

    if extensions.include?("pg_trgm")
      add_index(:custom_options, :value, using: "gin", opclass: :gin_trgm_ops)
    end

    add_index(:custom_options, :custom_field_id)
  end
end
